# TODO

## Canvas, SVG background?
Mapu, co má být na pozadí, zkusit testovat na velikost 375 x 667 px. Zdá se, že je to velmi
rozšířený rozměr pro menší, a tudíž náročnější zařízení.

## Komponenta Loading indicator
Nemá na to něco Vuetify? Pokud ne, tak bych měl vytvořit vlastní komponentu

## Povolení zapnout GPS
Podle best practices by se to nemělo dít hned při načtení homepage, ale až na uživatelovo gesto,
například že stiskne tlačítko "zapnout GPS". Také je best practice vysvětlit uživateli, k emu
to potřebuju a že je to v pohodě.

## ochrana před vícenásobným připojením ze stejné adresy
tzv. útok brute force. Viz rada https://peacockindia.mintlify.app/docs/secure-coding#preventing-brute-force-attacks
Jsou zde i jiné dobré rady.

## Zhasínání displeje při nečinnosti
Vypadá to, že Firefox to hodlá podporovat až ve verzi 125, která ještě není. Jinak je podpora
dobrá, kromě Opera mini.

## načítací kolečko, zatímco se startuje navigator.geolocation 

## na serveru neukládat do souborů
myslím, že pro práci serveru by bylo rychlejší něco jiného, než otevírat soubor, číst z něj,
zapsat do něj a uložit soubor. Co kdyby při založení Game Instance se vytvoří .ts soubor 
s kompletními funkcemi nutnými pro běh hry? Dělal by se jako instance nějaké classy.
Jeho jméno by bylo podle ID Game Instaance a dalo by se proto k němu přistupovat přímým
API dotazem na URL /game-instance/ID. 

## Přenačíst inicializaci geolocation po zapnutí GPS v mobilu
ideálně kdyby stránka sama od sebe poznala, že se GPS zapnulo, a znova inicializovala 
navigator.geolocation.watchPosition().
Jako alternativní řešení umístit tlačítko "znovu načíst polohu"

##  upozornit, že je potřeba zapnout GPS, i když povolení v prohlížeči bylo uděleno
aplikace by měla poznat, že GPS nejede a upozornit, ať si uživatel zapne/zkontrolje GPS

## zavést logger pro nějaké informační výpisy nepodstatných věcí

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
