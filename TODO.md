# TODO

## Zhasínání displeje při nečinnosti
pořád se zhasíná, i po aplikování navigator.wakeLock.request('screen')

## Přenačíst inicializaci geolocation po zapnutí GPS v mobilu
ideálně kdyby stránka sama od sebe poznala, že se GPS zapnulo, a znova inicializovala 
navigator.geolocation.watchPosition().
Jako alternativní řešení umístit tlačítko "znovu načíst polohu"

##  upozornit, že je potřeba zapnout GPS, i když povolení v prohlížeči bylo uděleno
aplikace by měla poznat, že GPS nejede a upozornit, ať si uživatel zapne/zkontrolje GPS
 
 
* * *  

* * *

# VYŘEŠENO

## timeout na geolocation hlásí chybu, i když je OK
po uplynutí timeoutu se zobrazí chyba, i když je vše OK, lokace se měří.
Souřadnice se měří, fungují, ale po timeoutu se z nějakého důvodu funkce navigator.geolocation.watchPosition
spustí svůj error callback.
-- zdá se, že firefox úplně vždy vyhodí timeout chybu. Vyřešil jem tak, že timeout a error callback jsem úplně vyhodil
a snad to pojede i tak. Musí, vždyť geolocation API musí už být podporováno úplně všude.
