export function showAppModal(message, onClose) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:9999;font-family:Arial,sans-serif';
    modal.innerHTML = `
        <div style="background:#fff;padding:22px;border-radius:10px;text-align:center;min-width:240px;max-width:280px;direction:rtl;box-shadow:0 4px 14px rgba(0,0,0,.25)">
            <p style="margin:0 0 16px;font-size:15px;color:#222;line-height:1.5">${message}</p>
            <button id="closeBtn" style="background:#007bff;color:#fff;border:none;padding:7px 20px;border-radius:5px;cursor:pointer;font-size:14px">حسنًا</button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#closeBtn').onclick = () => { modal.remove(); if(onClose) onClose(); };
}

export function showAppConfirm(message, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:9999;font-family:Arial,sans-serif';
    modal.innerHTML = `
        <div style="background:#fff;padding:22px;border-radius:10px;text-align:center;min-width:240px;max-width:280px;direction:rtl;box-shadow:0 4px 14px rgba(0,0,0,.25)">
            <p style="margin:0 0 18px;font-size:15px;color:#222;line-height:1.5">${message}</p>
            <div style="display:flex;justify-content:center;gap:10px">
                <button id="confirmBtn" style="background:#dc3545;color:#fff;border:none;padding:7px 18px;border-radius:5px;cursor:pointer;font-size:14px">نعم</button>
                <button id="cancelBtn" style="background:#6c757d;color:#fff;border:none;padding:7px 18px;border-radius:5px;cursor:pointer;font-size:14px">إلغاء</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#confirmBtn').onclick = () => { modal.remove(); if(onConfirm) onConfirm(); };
    modal.querySelector('#cancelBtn').onclick = () => { modal.remove(); if(onCancel) onCancel(); };
}