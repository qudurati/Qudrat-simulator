/* Main sustainable PDF now matches experimental renderer */
window.NAFS_PDF={
 async download(el,name){
  if(!window.NAFS_PDF_TEST) throw Error('experimental renderer not loaded');
  return window.NAFS_PDF_TEST.download(el,name||'خطة-نافس-المستدامة.pdf');
 }
};