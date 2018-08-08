import extend from './util/extend';
import Handle from './handle';
import Defaults from './defaults';
import Dragger from './dragger';
import Rect from './rect';
import Sticker from './sticker';
import DomObj from './domobj';
import Keyboard from './keyboard';
import Animate from './animate';

class Cropper extends DomObj {

  constructor(el,options={}) {
    super(el);
    this.options = extend({},Cropper.defaults,options);
    this.pos = Rect.from(this.el);
  }

  init() {
    this.createHandles();
    this.createMover();
    this.attachFocus();
    new Keyboard(this);
    return this;
  }

  attachToStage(stage) {
    this.stage = stage;
    this.emit('crop.attach');
  }

  attachFocus() {
    this.el.addEventListener('focus',(e) => {
      this.emit('crop.activate');
      this.emit('crop.update');
    },false);
  }

  animate(rect,frames,efunc){
    const t = this;
    efunc = efunc || t.options.animateEasingFunction || 'swing';
    frames = frames || t.options.animateFrames || 30;
    return Animate(t.el,t.pos,rect,r => t.render(r.normalize()),frames,efunc);
  }

  createMover() {
    const pe = this.el.parentElement;
    var w,h;
    this.pos = Rect.from(this.el);
    var stick;
    Dragger(
      this.el,
      () => {
        [w,h] = [ pe.offsetWidth, pe.offsetHeight ];
        stick = Rect.from(this.el);
        this.el.focus();
        this.emit('crop.activate');
        return true;
      },
      (x,y) => {
        this.pos.x = stick.x + x;
        this.pos.y = stick.y + y;
        this.render(this.pos.rebound(w,h));
      },
      () => { }
    )
  }

  nudge(x=0,y=0) {
    const pe = this.el.parentElement;
    const [w,h] = [ pe.offsetWidth, pe.offsetHeight ];
    if (x) this.pos.x += x;
    if (y) this.pos.y += y;
    this.render(this.pos.rebound(w,h));
  }

  createHandles() {
    this.options.handles.forEach(c => {
      const handle = Handle.create('handle '+c);
      handle.appendTo(this.el);

      var stick;
      Dragger(handle.el,
        () => {
          const pe = this.el.parentElement;
          const w = pe.offsetWidth;
          const h = pe.offsetHeight;
          stick = Sticker.create(Rect.from(this.el), w, h, c);
          if (this.aspect) stick.aspect = this.aspect;
          this.el.focus();
          this.emit('crop.active');
          return true;
        },
        (x,y) => this.render(stick.move(x,y)),
        () => { }
      );
    });
    return this;
  }

  isActive() {
    return (this.stage && (this.stage.active === this));
  }

  render(r) {
    r = r || this.pos;
    this.el.style.top = Math.round(r.y) + 'px';
    this.el.style.left = Math.round(r.x) + 'px';
    this.el.style.width = Math.round(r.w) + 'px';
    this.el.style.height = Math.round(r.h) + 'px';
    this.pos = r;
    this.emit('crop.update');
    return this;
  }

  doneDragging() {
    this.pos = Rect.from(this.el);
  }

}

Cropper.create = function(options={}){
  const el = document.createElement('div');
  const opts = extend({},Defaults,options);
  el.setAttribute('tabindex','0');
  el.className = opts.cropperClass || 'cropper';
  return new Cropper(el,opts);
};

export default Cropper;
