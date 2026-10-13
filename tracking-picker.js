/* All add-stock entry points reuse the stock tracking manager. */
document.addEventListener('click',e=>{if(!e.target.closest('[data-tracking-add]'))return;trackingCenter.open();trackingCenter.configure('300429',true);});
