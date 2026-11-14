/* Telegram Mini App adapter. No Yandex Games SDK or ad calls. */
(function() {
  'use strict';
  var tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
  var Ads = {
    sdk:null, player:null, tg:tg,
    init:function(){ return new Promise(function(resolve){
      if(!tg){resolve();return;}
      try { tg.ready(); tg.expand();
        if(tg.setHeaderColor) tg.setHeaderColor('#f5e6cf');
        if(tg.setBackgroundColor) tg.setBackgroundColor('#f5e6cf');
        if(tg.disableVerticalSwipes) tg.disableVerticalSwipes();
        if(tg.BackButton && tg.BackButton.onClick) tg.BackButton.onClick(function(){ if(typeof window.__telegramBack==='function') window.__telegramBack(); });
        resolve();
      } catch(e){resolve();}
    });},
    haptic:function(kind){ try { if(tg && tg.HapticFeedback){ if(kind==='success') tg.HapticFeedback.notificationOccurred('success'); else if(kind==='error') tg.HapticFeedback.notificationOccurred('error'); else tg.HapticFeedback.impactOccurred(kind||'light'); } } catch(e){} },
    showRewarded:function(onReward){ this.haptic('light'); if(typeof onReward==='function') onReward(); },
    showInterstitial:function(){},
    save:function(data){ var value; try{value=JSON.stringify(data);}catch(e){return;} try{localStorage.setItem('mousekin_save',value);}catch(e){} try{if(tg&&tg.CloudStorage&&tg.CloudStorage.setItem) tg.CloudStorage.setItem('mousekin_save',value,function(){});}catch(e){} },
    lsLoad:function(){try{var s=localStorage.getItem('mousekin_save');return s?JSON.parse(s):null;}catch(e){return null;}},
    load:function(){var self=this;return new Promise(function(resolve){var fallback=self.lsLoad();try{if(tg&&tg.CloudStorage&&tg.CloudStorage.getItem){tg.CloudStorage.getItem('mousekin_save',function(err,value){if(!err&&value){try{var parsed=JSON.parse(value);try{localStorage.setItem('mousekin_save',value);}catch(e){} resolve(parsed);return;}catch(e){}}resolve(fallback);});return;}}catch(e){}resolve(fallback);});},
    getLang:function(){try{var l=tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.language_code;if(l)return String(l).slice(0,2);}catch(e){}try{return(navigator.language||'ru').slice(0,2);}catch(e){return'ru';}},
    updateBackButton:function(visible){try{if(!tg||!tg.BackButton)return;if(visible)tg.BackButton.show();else tg.BackButton.hide();}catch(e){}}
  };
  window.Ads=Ads;
})();