// Existing interaction scenarios must wait for a programmatic map change just
// as a user waits behind the loading screen. Loading behavior itself is tested
// without this fixture in loading-acceptance.cjs.
module.exports=function waitForSceneTransitions(page){
  const evaluate=page.evaluate.bind(page);
  page.evaluate=async(...args)=>{
    await evaluate(()=>window.GameLoading?.whenReady());
    const result=await evaluate(...args);
    await evaluate(()=>window.GameLoading?.whenReady());
    return result;
  };
  return page;
};
