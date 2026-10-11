/** Render only the new website's approved service number, supplied at deployment. */
export default function SiteRegistration() {
  const number = process.env.SUNLIT_ICP_NUMBER?.trim();
  if (!number || !/^[\u4e00-\u9fff]ICP备\d{6,20}号-\d+$/.test(number)) return null;
  return <footer className="site-registration" aria-label="网站备案信息">
    <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">{number}</a>
  </footer>;
}
