import { surahNames, surahAyahCounts, juzRanges } from './data.js';
import { showAppModal, showAppConfirm } from './ui.js';

let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];

function validateAyahInput(ayah, surahName) {
    const surahNumber = surahNames.indexOf(surahName) + 1;
    const maxAyah = surahAyahCounts[surahNumber - 1];

    if (!ayah || isNaN(ayah) || parseInt(ayah) <= 0) {
        showAppModal("يرجى إدخال رقم آية صحيح وموجب.");
        return false;
    }

    if (parseInt(ayah) > maxAyah) {
        showAppModal(`رقم الآية يجب أن يكون بين 1 و ${maxAyah} لسورة ${surahName}`);
        return false;
    }

    return true;
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
        return "تاريخ غير صالح";
    }
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'م' : 'ص';
    const formattedHours = hours % 12 || 12;
    return `${day}/${month}/${year} <span class="time">الساعه:${formattedHours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}</span>`;
}

function getJuzNumber(surahNumber, ayahNumber) {
    for (let i = 0; i < juzRanges.length; i++) {
        const range = juzRanges[i];
        if (
            (surahNumber > range.startSurah || (surahNumber === range.startSurah && ayahNumber >= range.startAyah)) &&
            (surahNumber < range.endSurah || (surahNumber === range.endSurah && ayahNumber <= range.endAyah))
        ) {
            return `الجزء (${i + 1})`;
        }
    }
    return "الجزء (1)";
}

function getRemainingJuz(currentJuz) {
    const totalJuz = 30;
    const remaining = totalJuz - currentJuz;
    return `الأجزاء المتبقية: ${remaining}`;
}

function getRemainingSurah(currentSurah) {
    const totalSurah = 114;
    const remaining = totalSurah - currentSurah;
    return `السور المتبقية: ${remaining}`;
}

function populateSurahSelect() {
    const surahNameSelect = document.getElementById('surahName');
    surahNames.forEach((name) => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        surahNameSelect.appendChild(option);
    });
}

function saveAyah() {
    const surahName = document.getElementById('surahName').value;
    const ayah = document.getElementById('ayah').value;

    if (!validateAyahInput(ayah, surahName)) {
        return;
    }

    if (surahName && ayah) {
        const surahNumber = surahNames.indexOf(surahName) + 1;
        const ayahNumber = parseInt(ayah);

        // التحقق من التكرار
        const exists = bookmarks.some(b => b.surahName === surahName && b.ayah === ayah);
        if (exists) {
            showAppModal('هذه الآية محفوظة مسبقًا');
            return;
        }

        const juz = getJuzNumber(surahNumber, ayahNumber);
        const timestamp = new Date().toISOString();

        bookmarks.unshift({ surahName, juz, ayah, timestamp });
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        displayBookmarks();

        document.getElementById('surahName').value = '';
        document.getElementById('ayah').value = '';
    } else {
        showAppModal('الرجاء إدخال اسم السورة ورقم الآية');
    }
}

function displayBookmarks() {
    const tableBody = document.querySelector('#bookmarksTable tbody');
    tableBody.innerHTML = '';
    bookmarks.forEach((bookmark, index) => {
        const surahNumber = surahNames.indexOf(bookmark.surahName) + 1;
        const juzNumber = parseInt((bookmark.juz || '').match(/\d+/)?.[0] || 1);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                ${bookmark.surahName}<br>
                <span class="remaining">${getRemainingSurah(surahNumber)}</span>
            </td>
            <td>
                ${bookmark.juz}<br>
                <span class="remaining">${getRemainingJuz(juzNumber)}</span>
            </td>
            <td>${bookmark.ayah}</td>
            <td class="timestamp">${formatTimestamp(bookmark.timestamp)}</td>
        `;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'حذف';
        deleteBtn.style.cssText = 'margin:2px;padding:2px 6px;font-size:12px;background:#dc3545;color:#fff;border:none;border-radius:3px;cursor:pointer';
        deleteBtn.onclick = () => deleteBookmark(index);

        const editBtn = document.createElement('button');
        editBtn.textContent = 'تعديل';
        editBtn.style.cssText = 'margin:2px;padding:2px 6px;font-size:12px;background:#007bff;color:#fff;border:none;border-radius:3px;cursor:pointer';
        editBtn.onclick = () => editBookmark(index);

        const actionsTd = document.createElement('td');
        actionsTd.appendChild(deleteBtn);
        actionsTd.appendChild(document.createElement('br'));
        actionsTd.appendChild(editBtn);
        row.appendChild(actionsTd);

        tableBody.appendChild(row);
    });
}

function editBookmark(index) {
    const tr = document.querySelectorAll('#bookmarksTable tbody tr')[index];
    const surahTd = tr.cells[0];
    const ayahTd = tr.cells[2];
    const originalSurah = bookmarks[index].surahName;
    const originalAyah = bookmarks[index].ayah;

    // تبديل خلايا السورة والآية إلى حقول إدخال
    surahTd.innerHTML = `<select style="width:100%;font-size:14px">${surahNames.map(n=>`<option ${n===originalSurah?'selected':''}>${n}</option>`).join('')}</select>`;
    ayahTd.innerHTML = `<input type="number" value="${originalAyah}" style="width:80%;font-size:14px">`;

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'حفظ';
    saveBtn.style.cssText = 'margin:2px;padding:2px 6px;font-size:12px;background:#28a745;color:#fff;border:none;border-radius:3px;cursor:pointer';
    saveBtn.onclick = () => {
        const newSurah = surahTd.querySelector('select').value;
        const newAyah = parseInt(ayahTd.querySelector('input').value);
        if (!validateAyahInput(newAyah, newSurah)) return;
        const surahNumber = surahNames.indexOf(newSurah) + 1;
        bookmarks[index] = {
            surahName: newSurah,
            juz: getJuzNumber(surahNumber, newAyah),
            ayah: newAyah,
            timestamp: bookmarks[index].timestamp
        };
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        displayBookmarks();
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'إلغاء';
    cancelBtn.style.cssText = 'margin:2px;padding:2px 6px;font-size:12px;background:#6c757d;color:#fff;border:none;border-radius:3px;cursor:pointer';
    cancelBtn.onclick = () => displayBookmarks();

    const actionsTd = tr.cells[4];
    actionsTd.innerHTML = '';
    actionsTd.appendChild(saveBtn);
    actionsTd.appendChild(document.createElement('br'));
    actionsTd.appendChild(cancelBtn);
}

function deleteBookmark(index) {
    const bookmark = bookmarks[index];
    showAppConfirm(`هل أنت متأكد من حذف آية ${bookmark.ayah} من سورة ${bookmark.surahName}؟`, () => {
        bookmarks.splice(index, 1);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        displayBookmarks();
    });
}

function clearAllData() {
    if (!bookmarks.length) {
        showAppModal('لا توجد بيانات لمسحها');
        return;
    }
    showAppConfirm('هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.', () => {
        bookmarks = [];
        localStorage.removeItem('bookmarks');
        displayBookmarks();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    populateSurahSelect();
    displayBookmarks();
    document.getElementById('clearBtn').addEventListener('click', clearAllData);
    document.getElementById('saveBtn').addEventListener('click', saveAyah);
});