#!/usr/bin/env python3
"""Copy-only, consistent backup. Failed staging and old backups are retained."""
import datetime
import hashlib
import json
import os
from pathlib import Path
import shutil
import sqlite3


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def main():
    os.umask(0o077)
    data = Path(os.environ.get('SUNLIT_DATA_DIR', '/opt/sunlit/data')).resolve()
    backups = Path(os.environ.get('SUNLIT_BACKUP_DIR', '/opt/sunlit/backups')).resolve()
    release = Path(os.environ.get('SUNLIT_RELEASE_DIR', '/opt/sunlit/current')).resolve()
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    stage = backups / ('staging-' + stamp)
    stage.mkdir(parents=True, mode=0o700)
    (stage / 'data').mkdir(mode=0o700)
    source = sqlite3.connect((data / 'sunlit.sqlite').as_uri() + '?mode=ro', uri=True)
    target = sqlite3.connect(str(stage / 'data' / 'sunlit.sqlite'))
    source.backup(target)
    integrity = target.execute('PRAGMA integrity_check').fetchone()[0]
    if integrity != 'ok':
        raise RuntimeError('Database integrity check failed')
    media = target.execute('SELECT id,size FROM media').fetchall()
    counts = {name: target.execute('SELECT COUNT(*) FROM ' + name).fetchone()[0]
              for name in ('articles', 'media', 'administrator')}
    target.close()
    source.close()
    if (data / 'uploads').exists():
        # Media is immutable; the database snapshot is taken before copying files.
        shutil.copytree(str(data / 'uploads'), str(stage / 'data' / 'uploads'))
    for ident, size in media:
        path = stage / 'data' / 'uploads' / ident
        if not path.is_file() or path.stat().st_size != size:
            raise RuntimeError('Required upload missing or inconsistent')
    if (data / 'first-admin-key').exists():
        shutil.copy2(str(data / 'first-admin-key'), str(stage / 'data' / 'first-admin-key'))
    env = Path(os.environ.get('SUNLIT_ENV_FILE', '/etc/sunlit.env'))
    if env.is_file():
        shutil.copy2(str(env), str(stage / 'environment.env'))
    # The immutable release archive includes source, assets, build and Linux dependencies.
    release_archive = release / 'release-complete.tar.gz'
    if not release_archive.is_file():
        raise RuntimeError('Complete release archive is missing')
    # Keep each immutable release once, then link it within the writable backup
    # directory. This also works inside systemd's read-only filesystem namespace.
    release_hash = sha256(release_archive)
    cache = backups / 'releases'
    cache.mkdir(mode=0o700, exist_ok=True)
    cached = cache / (release_hash + '.tar.gz')
    if not cached.exists():
        if shutil.disk_usage(str(backups)).free < release_archive.stat().st_size + 1024**3:
            raise RuntimeError('Less than 1 GiB would remain after backup')
        shutil.copy2(str(release_archive), str(cached) + '.partial')
        if sha256(Path(str(cached) + '.partial')) != release_hash:
            raise RuntimeError('Release copy checksum failed')
        Path(str(cached) + '.partial').rename(cached)
    elif sha256(cached) != release_hash:
        raise RuntimeError('Cached release checksum failed')
    os.link(str(cached), str(stage / 'release-complete.tar.gz'))
    files = {str(p.relative_to(stage)): {'size': p.stat().st_size, 'sha256': sha256(p)}
             for p in sorted(stage.rglob('*')) if p.is_file()}
    manifest = {'createdAt': stamp, 'release': str(release), 'integrity': integrity,
                'counts': counts, 'files': files}
    (stage / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    # A snapshot is complete: database, media, setup key, config, source and build.
    # Immutable program archives share disk blocks across snapshots; nothing is pruned.
    for name, record in files.items():
        if sha256(stage / name) != record['sha256']:
            raise RuntimeError('Snapshot checksum failed')
    output = backups / ('sunlit-' + stamp)
    stage.rename(output)
    size = sum(record['size'] for record in files.values())
    (backups / 'latest-success.json').write_text(json.dumps({
        'snapshot': str(output), 'createdAt': stamp, 'logicalSize': size,
        'manifestSha256': sha256(output / 'manifest.json'), 'counts': counts
    }, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'backup': str(output), 'logicalSize': size,
                      'integrity': integrity, 'counts': counts}, ensure_ascii=False))
    # No automatic pruning: old backups and staging are preserved for inspection.


if __name__ == '__main__':
    main()
