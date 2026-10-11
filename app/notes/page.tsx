import Link from "@/components/SectionLink";
import NotesList from "../notes-list";
import ManageNotesLink from "@/components/ManageNotesLink";
export const metadata={title:"随笔 · 日光之间"};
export default function Notes(){return <main className="journal-page"><section className="journal-container"><div className="journal-title"><span className="handwriting">Notes to self.</span><p className="eyebrow">SUNLIT NOTES</p><h1>随笔，不必成章。</h1><p>给生活、阅读和没想完的问题，留一点空白。</p><ManageNotesLink stamp/></div><NotesList/><footer className="journal-footer"><span>持续生长中的笔记本。</span><Link href="/">回到首页</Link></footer></section></main>;}
