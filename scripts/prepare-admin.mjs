import { mkdirSync,existsSync,writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
const dir=path.resolve(process.env.SUNLIT_DATA_DIR||'.local-data');mkdirSync(dir,{recursive:true,mode:0o700});const keyFile=path.join(dir,'first-admin-key');if(!existsSync(keyFile))writeFileSync(keyFile,randomBytes(32).toString('base64url'),{mode:0o600,flag:'wx'});
console.log('管理员初始化页面：http://127.0.0.1:5173/admin/setup');
console.log('一次性初始化密钥保存在：'+keyFile);
console.log('在本机打开该文件，把密钥填入初始化页，然后自行设置账号与密码。账号创建后该密钥不再可用。');
