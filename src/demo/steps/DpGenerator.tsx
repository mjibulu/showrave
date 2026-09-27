import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import QRCode from 'qrcode';
import { useDemo } from '../../state/DemoProvider';
import { locationLine, longDate, shortTime } from '../../lib/format';
import { downloadBlob, slugify } from '../../lib/download';
import { DP_FONTS, DP_SIZE, TEMPLATES, drawDp } from '../../lib/dpTemplates';
import { loadImage, readImageFile } from '../../lib/image';
import { BrowserFrame } from '../../components/Frames';
import { Field } from '../../components/ui';
import { Icon } from '../../components/Icon';

const MESSAGES = ['See you there', "I'll be there", 'Count me in', 'Save the date'];
const SAMPLE_PHOTO = `${import.meta.env.BASE_URL}assets/demo/avatar.svg`;

export function DpGenerator() {
  const { state, setDp } = useDemo();
  const { event, dp } = state;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [qr, setQr] = useState<HTMLCanvasElement | null>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [toast, setToast] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    Promise.all(DP_FONTS.map((font) => document.fonts.load(font))).finally(() => setFontsReady(true));
  }, []);

  useEffect(() => {
    let active = true;
    loadImage(dp.photo ?? SAMPLE_PHOTO).then((image) => active && setPhoto(image)).catch(() => active && setPhoto(null));
    return () => { active = false; };
  }, [dp.photo]);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    QRCode.toCanvas(canvas, `https://showrave.com/event/${slugify(event.name)}`, { margin: 1, width: 272 })
      .then(() => setQr(canvas))
      .catch(() => setQr(null));
  }, [event.name]);

  useEffect(() => {
    if (!canvasRef.current) return;
    drawDp(canvasRef.current, {
      eventName: event.name || 'Your event',
      category: event.category,
      dateText: `${longDate(event)}, ${shortTime(event)}`,
      placeText: locationLine(event),
      dp,
      photo,
      qr,
    });
  }, [event, dp, photo, qr, fontsReady]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const onFile = async (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) {
      if (file) setToast('Choose an image file (JPG, PNG or WebP).');
      return;
    }
    try {
      const dataUrl = await readImageFile(file, 1200);
      setDp({ photo: dataUrl, zoom: 100, offsetX: 0, offsetY: 0 });
    } catch {
      setToast('Could not open image. Try another.');
    }
  };

  const pointerScale = () => DP_SIZE / (canvasRef.current?.getBoundingClientRect().width || DP_SIZE);

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: dp.offsetX, oy: dp.offsetY };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drag.current) return;
    const scale = pointerScale();
    setDp({
      offsetX: Math.round(drag.current.ox + (e.clientX - drag.current.x) * scale),
      offsetY: Math.round(drag.current.oy + (e.clientY - drag.current.y) * scale),
    });
  };
  const onPointerUp = () => { drag.current = null; };

  const filename = `showrave-${slugify(event.name)}-${dp.template}.png`;

  const toBlob = () =>
    new Promise<Blob | null>((resolve) => {
      if (canvasRef.current) canvasRef.current.toBlob(resolve, 'image/png');
      else resolve(null);
    });

  const download = async () => {
    const blob = await toBlob();
    if (blob) downloadBlob(blob, filename);
  };

  const share = async () => {
    const blob = await toBlob();
    if (!blob) return;
    const file = new File([blob], filename, { type: 'image/png' });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'My Event DP' });
        return;
      }
      if (navigator.clipboard && 'ClipboardItem' in window) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setToast('Image copied');
        return;
      }
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') return;
    }
    downloadBlob(blob, filename);
  };

  return (
    <BrowserFrame url="dp.showrave.com/editor">
      <div className="dp">
        <div className="dp-controls">
          <section>
            <h4>Template</h4>
            <div className="template-strip" role="radiogroup" aria-label="Template">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  role="radio"
                  aria-checked={dp.template === template.id}
                  className="template-chip"
                  onClick={() => setDp({ template: template.id })}
                >
                  <span className="template-swatch" style={{ background: `linear-gradient(135deg, ${template.colors[0]} 55%, ${template.colors[1]} 55%)` }} />
                  <strong>{template.name}</strong>
                </button>
              ))}
            </div>
          </section>

          <section className="dp-event">
            <h4>Event</h4>
            <div className="dp-event-card">
              <Icon name="ticket" size={18} />
              <div>
                <strong>{event.name}</strong>
                <small>{longDate(event)} · {locationLine(event)}</small>
              </div>
            </div>
          </section>

          <section>
            <h4>Photo</h4>
            <div
              className={`dropzone ${dragOver ? 'is-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); onFile(e.dataTransfer.files[0]); }}
            >
              <input ref={fileRef} type="file" accept="image/*" className="sr-only" id="dp-photo" onChange={(e) => onFile(e.target.files?.[0])} />
              <label htmlFor="dp-photo" className="btn btn--dark btn--sm"><Icon name="image" size={15} /> {dp.photo ? 'Change photo' : 'Upload photo'}</label>
              <span>Or drop an image. Drag the preview to move it.</span>
            </div>
            <div className="zoom-row">
              <label htmlFor="dp-zoom">Zoom</label>
              <input id="dp-zoom" type="range" min={50} max={300} step={5} value={dp.zoom} onChange={(e) => setDp({ zoom: Number(e.target.value) })} />
              <output htmlFor="dp-zoom">{dp.zoom}%</output>
              <button type="button" className="link-btn" onClick={() => setDp({ zoom: 100, offsetX: 0, offsetY: 0 })}>Reset</button>
            </div>
          </section>

          <Field label="Name">
            {(id) => <input id={id} value={dp.name} maxLength={28} onChange={(e) => setDp({ name: e.target.value })} />}
          </Field>

          <section>
            <h4>Message</h4>
            <div className="chip-row" role="radiogroup" aria-label="Message">
              {MESSAGES.map((message) => (
                <button key={message} type="button" role="radio" aria-checked={dp.message === message} className="chip-btn" onClick={() => setDp({ message })}>
                  {message}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="dp-preview">
          <canvas
            ref={canvasRef}
            width={DP_SIZE}
            height={DP_SIZE}
            role="img"
            aria-label={`Display picture preview using the ${TEMPLATES.find((t) => t.id === dp.template)?.name} template`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          />
          <div className="row-actions">
            <button type="button" className="btn btn--primary" onClick={download}><Icon name="download" size={16} /> Download PNG</button>
            <button type="button" className="btn btn--ghost" onClick={share}><Icon name="share" size={16} /> Share</button>
          </div>
          {toast && <div className="toast" role="status">{toast}</div>}
        </div>
      </div>
    </BrowserFrame>
  );
}
