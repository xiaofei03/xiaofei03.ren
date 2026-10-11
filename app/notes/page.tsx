import NotesList from "../notes-list";
import ManageNotesLink from "@/components/ManageNotesLink";
export const metadata={title:"随笔 · 日光之间"};
export default function Notes(){return <main className="journal-page"><header className="journal-nav"><a href="/" className="journal-brand"><img className="journal-avatar" src="/assets/home-v2/avatar-front.webp" alt="孙烁飞的插画头像"/>日光之间</a><ManageNotesLink/></header><section className="journal-container"><div className="journal-title"><span className="handwriting">Notes to self.</span><p className="eyebrow">SUNLIT NOTES</p><h1>随笔，不必成章。</h1><p>给生活、阅读和没想完的问题，留一点空白。</p><span className="journal-stamp">慢慢写<br/>慢慢想</span></div><NotesList/><footer className="journal-footer"><span>持续生长中的笔记本。</span><a href="/">回到首页</a></footer></section></main>;}
