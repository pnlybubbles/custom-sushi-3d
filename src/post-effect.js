const fs = require('fs');
const gr = require('grimoirejs').default;
const {MaterialFactory} = require('grimoirejs-fundamental').default.Material;

const fxaa = fs.readFileSync(__dirname + '/fxaa.sort').toString();
MaterialFactory.addSORTMaterial("fxaa", fxaa);
gr.registerNode("render-fxaa", [], {
  material: "new(fxaa)"
}, "render-quad");

const vignetting = fs.readFileSync(__dirname + '/vignetting.sort').toString();
MaterialFactory.addSORTMaterial("vignetting", vignetting);
gr.registerNode("render-vignetting", [], {
  material: "new(vignetting)"
}, "render-quad");

const aberration = fs.readFileSync(__dirname + '/aberration.sort').toString();
MaterialFactory.addSORTMaterial("aberration", aberration);
gr.registerNode("render-aberration", [], {
  material: "new(aberration)"
}, "render-quad");

const hud = fs.readFileSync(__dirname + '/hud.sort').toString();
MaterialFactory.addSORTMaterial("hud", hud);
gr.registerNode("render-hud", [], {
  material: "new(hud)"
}, "render-quad");
