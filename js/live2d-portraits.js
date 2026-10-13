(() => {
  'use strict';
  let instance = null, serial = 0, initialized = false;
  const bundlePromises = new Map();
  function initialize() {
    if (initialized) return;
    const sdk = window.AshenCubism;
    if (!sdk || !window.Live2DCubismCore) throw new Error('Cubism SDK unavailable');
    sdk.CubismShader_WebGL.prototype.loadShader = async function(url) {
      const source = window.AshenCubismShaders?.[url.split('/').pop()];
      if (typeof source !== 'string') throw new Error('Missing bundled Cubism shader');
      return source;
    };
    const options = new sdk.Option();
    options.logFunction = message => console.debug('[Cubism]', message);
    sdk.CubismFramework.startUp(options); sdk.CubismFramework.initialize(); initialized = true;
  }
  function loadBundle(id) {
    const entry = window.CharacterPortraits?.entries[id];
    if (window.CharacterModelBundles?.[id]) return Promise.resolve(window.CharacterModelBundles[id]);
    if (!entry?.modelBundle) return Promise.resolve(null);
    if (!bundlePromises.has(id)) bundlePromises.set(id, new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const timer = setTimeout(() => {script.remove(); reject(new Error('Model load timeout'));}, 20000);
      script.src = entry.modelBundle;
      script.onload = () => {clearTimeout(timer); script.remove(); const bundle = window.CharacterModelBundles?.[id]; bundle ? resolve(bundle) : reject(new Error('Missing model bundle'));};
      script.onerror = () => {clearTimeout(timer); script.remove(); reject(new Error('Model bundle unavailable'));};
      document.head.append(script);
    }).catch(error => {bundlePromises.delete(id); throw error;}));
    return bundlePromises.get(id);
  }
  function dispose() {
    serial++;
    const current = instance; instance = null;
    if (!current) return;
    cancelAnimationFrame(current.raf); current.resize?.disconnect();
    current.canvas.removeEventListener('webglcontextlost', current.onLost);
    if (current.gl) for (const texture of current.textures) current.gl.deleteTexture(texture);
    if (current.physics) AshenCubism.CubismPhysics.delete(current.physics);
    current.user?.release();
    if (current.gl) {
      AshenCubism.CubismShaderManager_WebGL.deleteInstance();
      current.gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
    current.canvas.hidden = true;
    if (current.image?.isConnected) current.image.hidden = false;
  }
  function pause(value = true) {
    if (!instance) return;
    instance.paused = value; instance.mouthUntil = 0;
    if (value) {cancelAnimationFrame(instance.raf); instance.raf = 0;}
    else if (!instance.raf && !document.hidden) {instance.last = performance.now(); instance.raf = requestAnimationFrame(frame);}
  }
  function pulse(char) {
    if (!instance) return;
    instance.mouthUntil = /[\s，。！？；：、,.!?;:]/u.test(char || '') ? 0 : performance.now() + 100;
  }
  function stopSpeaking() {if (instance) instance.mouthUntil = 0;}
  function setExpression(name = 'neutral') {if (instance) instance.expression = name;}
  function resize(current) {
    const rect = window.GameViewport.localRect(current.canvas);
    const dpr = Math.min(devicePixelRatio || 1, 2);
    current.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    current.canvas.height = Math.max(1, Math.round(rect.height * dpr));
  }
  function setParameter(current, name, value) {
    const index = current.parameters.get(name);
    if (index !== undefined) current.model.setParameterValueByIndex(index, value);
  }
  function frame(now) {
    const current = instance;
    if (!current || current.paused || document.hidden || !current.canvas.isConnected) {if (current) current.raf = 0; return;}
    current.raf = 0;
    try {
      const t = (now - current.started) / 1000;
      const dt = Math.min(.05, Math.max(0, (now - current.last) / 1000)); current.last = now;
      current.model.loadParameters();
      const blinkPhase = t % 4.3;
      const eye = blinkPhase < .20 ? Math.abs(blinkPhase - .10) / .10 : 1;
      setParameter(current, 'ParamEyeLOpen', eye); setParameter(current, 'ParamEyeROpen', eye);
      setParameter(current, 'ParamMouthOpenY', now < current.mouthUntil ? .35 + .45 * Math.abs(Math.sin(t * 25)) : 0);
      setParameter(current, 'ParamMouthForm', current.expression === 'smile' ? 1 : current.expression === 'serious' ? -1 : 0);
      setParameter(current, 'ParamAngleX', Math.sin(t * .65) * 5);
      setParameter(current, 'ParamAngleY', Math.sin(t * .5) * 3);
      setParameter(current, 'ParamAngleZ', Math.sin(t * .45) * 2);
      setParameter(current, 'ParamBodyAngleX', Math.sin(t * .35) * 2);
      setParameter(current, 'ParamBodyAngleZ', Math.sin(t * .35) * 3);
      setParameter(current, 'ParamBreath', .5 + .5 * Math.sin(t * 1.4));
      for (const parameter of current.expressions[current.expression]?.Parameters || []) {
        const index = current.parameters.get(parameter.Id);
        if (index === undefined) continue;
        const value = current.model.getParameterValueByIndex(index);
        current.model.setParameterValueByIndex(index, parameter.Blend === 'Add' ? value + parameter.Value : parameter.Blend === 'Multiply' ? value * parameter.Value : parameter.Value);
      }
      current.physics?.evaluate(current.model, dt); current.model.update();
      const gl = current.gl;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, current.canvas.width, current.canvas.height);
      gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
      const matrix = new AshenCubism.CubismMatrix44();
      matrix.scale(current.canvas.height / current.canvas.width, 1);
      matrix.multiplyByMatrix(current.user.getModelMatrix());
      const renderer = current.user.getRenderer();
      renderer.setMvpMatrix(matrix); renderer.setRenderState(null, [0,0,current.canvas.width,current.canvas.height]);
      renderer.drawModel();
      current.raf = requestAnimationFrame(frame);
    } catch (error) {console.warn('Live2D portrait fallback:', error.message); dispose();}
  }
  async function mount(element, id, reduceMotion = false, expression = 'neutral') {
    dispose();
    if (!element || reduceMotion || !window.CharacterPortraits?.entries[id]?.modelBundle) return;
    const token = serial, image = element.querySelector('img'), canvas = element.querySelector('canvas');
    if (!canvas) return;
    try {
      const bundle = await loadBundle(id);
      if (token !== serial || !element.isConnected || !bundle) return;
      initialize();
      const current = {id, canvas, image, textures: [], user: null, raf: 0, paused: document.hidden, mouthUntil: 0, expression, expressions:bundle.expressions || {}, started: performance.now(), last: performance.now()};
      instance = current;
      canvas.hidden = false; resize(current);
      const gl = canvas.getContext('webgl', {alpha:true, premultipliedAlpha:true, antialias:true}); current.gl = gl;
      if (!gl) throw new Error('WebGL unavailable');
      current.onLost = event => {event.preventDefault(); dispose();};
      canvas.addEventListener('webglcontextlost', current.onLost);
      const bytes = Uint8Array.from(atob(bundle.moc), c => c.charCodeAt(0));
      current.user = new AshenCubism.CubismUserModel(); current.user.loadModel(bytes.buffer, true);
      current.model = current.user.getModel();
      if (!current.model) throw new Error('Invalid Cubism model');
      current.parameters = new Map();
      for (let i = 0; i < current.model.getParameterCount(); i++) current.parameters.set(current.model.getParameterId(i).getString(), i);
      // Cubism exports have their origin at the center of the source canvas.
      current.user.getModelMatrix().setHeight(2.45);
      current.user.getModelMatrix().translateY(-.29);
      current.user.createRenderer(canvas.width, canvas.height);
      const renderer = current.user.getRenderer(); renderer.startUp(gl); renderer.setIsPremultipliedAlpha(true);
      await Promise.all(bundle.textures.map((src, index) => new Promise((resolve, reject) => {
        const textureImage = new Image();
        const timeout = setTimeout(() => reject(new Error('Model texture load timeout')), 15000);
        textureImage.onload = () => {
          clearTimeout(timeout);
          if (instance !== current) {resolve(); return;}
          const texture = gl.createTexture(); current.textures.push(texture);
          gl.bindTexture(gl.TEXTURE_2D, texture); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,textureImage);
          gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
          renderer.bindTexture(index, texture); resolve();
        };
        textureImage.onerror = () => {clearTimeout(timeout); reject(new Error('Invalid model texture'));}; textureImage.src = src;
      })));
      if (instance !== current) return;
      if (bundle.physics) {const bytes = new TextEncoder().encode(JSON.stringify(bundle.physics)); current.physics = AshenCubism.CubismPhysics.create(bytes.buffer, bytes.byteLength);}
      renderer.loadShaders();
      if (image) image.hidden = true;
      current.resize = new ResizeObserver(() => {if (instance === current) resize(current);}); current.resize.observe(canvas);
      if (!current.paused) current.raf = requestAnimationFrame(frame);
    } catch (error) {
      if (token === serial) {console.warn('Live2D portrait fallback:', error.message); dispose();}
    }
  }
  document.addEventListener('visibilitychange', () => pause(document.hidden));
  window.Live2DPortraits = {mount, switchCharacter:mount, preload:loadBundle, setExpression, pulse, stopSpeaking, pause, dispose,
    inspect: () => instance ? {id:instance.id, paused:instance.paused, mouthOpen:performance.now() < instance.mouthUntil, expression:instance.expression, parameters:[...instance.parameters.keys()], values:Object.fromEntries([...instance.parameters].map(([name,index])=>[name,instance.model.getParameterValueByIndex(index)])), active:!!instance.raf} : {active:false}};
})();
