# TODO

## Zhasínání displeje při nečinnosti
pořád se zhasíná, i po aplikování navigator.wakeLock.request('screen').
Konzole občas hlásí "NotAllowedError, Failed to execute 'request' on 'WakeLock': The requesting page is not visible"
Možná se to spraví, když bude pravidelně chodit požadavek na server a to 
bude stránka brát, jako že je aktivní? Podle jednoho komentáře to je ale na iOs
problém, pokud je to nainstalováno jako PWA, ae ne takový, pokud je to 
"pouze" ve webovém prohlížeči.
Vypadá to, že Firefox to hodlá podporovat až ve verzi 125, která ještě není. Jinak je podpora
dobrá, kromě Opera mini.

## načítací kolečko, zatímco se startuje navigator.geolocation 

## Přenačíst inicializaci geolocation po zapnutí GPS v mobilu
ideálně kdyby stránka sama od sebe poznala, že se GPS zapnulo, a znova inicializovala 
navigator.geolocation.watchPosition().
Jako alternativní řešení umístit tlačítko "znovu načíst polohu"

##  upozornit, že je potřeba zapnout GPS, i když povolení v prohlížeči bylo uděleno
aplikace by měla poznat, že GPS nejede a upozornit, ať si uživatel zapne/zkontrolje GPS

## autoimport composables
Nuxt se dušuje, že to má automaticky, ale prdlajs.
https://nuxt.com/docs/examples/features/auto-imports

## zavést logger pro nějaké trapné informační výpisy

## nástup na žebříky a shazování útočníků nedělat ve stejný moment
Bude vypadat přirozeněji, pokud budou útočníci nastupovat na každý žebřík podle sebe, a ne
ve všech místech najednou. Stejn tak by vypadalo přirozeněji, pokud shazování útočníků bude
probíhat na každém polygonu v trošku jiný moment.

* * *  

* * *

# VYŘEŠENO

## timeout na geolocation hlásí chybu, i když je OK
po uplynutí timeoutu se zobrazí chyba, i když je vše OK, lokace se měří.
Souřadnice se měří, fungují, ale po timeoutu se z nějakého důvodu funkce navigator.geolocation.watchPosition
spustí svůj error callback.
-- zdá se, že firefox úplně vždy vyhodí timeout chybu. Vyřešil jem tak, že timeout a error callback jsem úplně vyhodil
a snad to pojede i tak. Musí, vždyť geolocation API musí už být podporováno úplně všude.
