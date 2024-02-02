# TODO

## Zhasínání displeje při nečinnosti
Vypadá to, že Firefox to hodlá podporovat až ve verzi 125, která ještě není. Jinak je podpora
dobrá, kromě Opera mini.

## načítací kolečko, zatímco se startuje navigator.geolocation 

## Přenačíst inicializaci geolocation po zapnutí GPS v mobilu
ideálně kdyby stránka sama od sebe poznala, že se GPS zapnulo, a znova inicializovala 
navigator.geolocation.watchPosition().
Jako alternativní řešení umístit tlačítko "znovu načíst polohu"

##  upozornit, že je potřeba zapnout GPS, i když povolení v prohlížeči bylo uděleno
aplikace by měla poznat, že GPS nejede a upozornit, ať si uživatel zapne/zkontrolje GPS

## zavést logger pro nějaké trapné informační výpisy

## nástup na žebříky a shazování útočníků nedělat ve stejný moment
Bude vypadat přirozeněji, pokud budou útočníci nastupovat na každý žebřík podle sebe, a ne
ve všech místech najednou. Stejně tak by vypadalo přirozeněji, pokud shazování útočníků bude
probíhat na každém polygonu v trošku jiný moment.

## Počítadlo, kolik zranění nebo zabitých útočníků uživatel dostal
Bude to asi složité v tom momentu, kdy bude na obraně víde obránců, než kolik útočníků vůbec
může dostat zranění a bude se muset rozhodnout, kteří z obránců vystřelili "do vzduchu". 

## Platba
co takhle nechat na lidech, ať prostě pošlou, kolik si myslí, že jim za to stálo?

## přihlášení
Zvolený kapitán otevře aplikaci, zvolí, že jde na to. Aplikace mu vygeneruje QR kód a případně
jiné prvky, to si ostatní hráči naskenují (bude to nějaká URL s jedinečným hashem právě pro tu
jednu partu). Ten samý kapitán, až všichni nahlásí, že jsou v aplikaci také, hru spustí. 
* * *
* * *

# VYŘEŠENO

## timeout na geolocation hlásí chybu, i když je OK
po uplynutí timeoutu se zobrazí chyba, i když je vše OK, lokace se měří.
Souřadnice se měří, fungují, ale po timeoutu se z nějakého důvodu funkce navigator.geolocation.watchPosition
spustí svůj error callback.
-- zdá se, že firefox úplně vždy vyhodí timeout chybu. Vyřešil jem tak, že timeout a error callback jsem úplně vyhodil
a snad to pojede i tak. Musí, vždyť geolocation API musí už být podporováno úplně všude.
