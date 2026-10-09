import NotesList from "../notes-list";
import { NotebookPen } from "lucide-react";
export const metadata={title:"随笔 · 孙烁飞"};
export default function Notes(){return <main className="journal-page"><header className="journal-nav"><a href="/" className="journal-brand"><span className="brand-mark">S.</span>烁飞的桌面</a><a href="/studio" className="quiet-link"><NotebookPen size={16}/>写作工作室</a></header><section className="journal-container"><div className="journal-title"><span className="handwriting">Notes to self.</span><p className="eyebrow">SHUOFEI'S JOURNAL</p><h1>随笔，不必成章。</h1><p>给生活、阅读和没想完的问题，留一点空白。</p><span className="journal-stamp">慢慢写<br/>慢慢想</span></div><NotesList/><footer className="journal-footer"><span>持续生长中的笔记本。</span><a href="/">回到桌面</a></footer></section></main>;}
