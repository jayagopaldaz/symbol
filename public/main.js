const left  = document.getElementById('left');
const scene = document.getElementById('scene');
const right = document.getElementById('right');

const leftSubmit  = document.getElementById('left/submit');
const rightSubmit = document.getElementById('right/submit');

const baseURL = 'http://localhost:3000/';

const format = (txt) => txt
    .replace(/Bhumi/g, '<b>Bhumi</b>')
    .replace(/Hero/g, '<b>Hero</b>');
    // .replace(/\n/g, '<br>');

// fetch(baseURL+'scene') .then(res => res.text()).then(data => scene.src = data);

const get = async (being, state) =>
    await fetch(baseURL+`get/${state}/${being}`)
        .then(res => res.text())
        .then(data => format(data));

const set = async (being, state, data) => {
    return await fetch(baseURL+`set/${state}/${being}`, {
        method: "POST",
        mode: "no-cors", // no-cors, *cors, same-origin
        // cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        // credentials: "same-origin", // include, *same-origin, omit
        headers: {"Content-Type": "text/plain"},          // 'Content-Type': 'application/x-www-form-urlencoded',
        // redirect: "follow", // manual, *follow, error
        // referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: data
    })
    .then(res => res.text())
    .then(data => format(data));
};

const init = async () => {
    const [internal, shared] = (await get('Simb01ic', 'current')).split('|%|');
    left.innerHTML = internal;
    right.firstElementChild.innerHTML = shared;
};

leftSubmit.onclick = async () => {
    left.innerHTML += '<center><img src=spinner.svg /></center>';
    left.innerHTML = (await get('Simb01ic', 'update')).split('|%|')[0];
}

rightSubmit.onclick = async () => {
    left.innerHTML += '<b>Jayarama: </b> ' + right.children[1].innerHTML 
                +'<center><img src=spinner.svg /></center>';

    const [internal, shared] = (await set('Simb01ic', 'present', right.children[1].innerHTML)).split('|%|');
    left.innerHTML = internal;
    right.firstElementChild.innerHTML = shared;
    right.children[1].innerHTML = '...';
}

init();
