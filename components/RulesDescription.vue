<script setup lang="ts">
import cauldronFullIcon from "assets/icons/cauldron-full.svg";
import invaderStandard from "assets/icons/invader-regular.svg";
import invaderCaptain from "assets/icons/invader-captain.svg";
import defenderNoWeapon from "assets/icons/defender-no-weapon-me.svg";
import defenderSword from "assets/icons/defender-swordsman-me.svg";
import defenderCannon from "assets/icons/defender-cannon-me.svg";
</script>

<template>
  <h2 class="mb-2 text-h4">Jak hrát Hradní hlídku</h2>

  <h3 class="mb-2 text-h5">Na vaše pozice se dobývají nepřátelé!</h3>

  <p class="mb-2">Přistavili žebřík na několika místeh a po něm se šplhají nahoru. Pokud se byť jen jediný z nich dostane
    až na vrchol, bude bitva ztracena. Jak je odrazit?</p>

  <img :src="invaderStandard" alt="Invader" class="custom-icon ma-2" />

  <p class="mb-2">Pokud na úseku hradeb, kam je položen žebřík, stojí obránce, tak útočníci <strong>na</strong> takovém žebříku jsou automaticky
    zraňováni a ničeni.
  Neplatí jen pro obránce s dělem - dělo naopak může ničit jen nepřátele, co stojí teprve <strong>před</strong> žebříkem.
  Máš-li meč nebo žádnou zbraň, musíš se pohybovat na ohrožené úseky, kde je útočník na žebříku. Máš-li dělo, nemusíš
  nikam běžet, protože z žebříku shazovat neumíš. Ale ostřeluješ shromažďovací místa před žebříkem.</p>

  <p class="mb-2">Pozor ovšem na <strong>Kapitána</strong>.
    <img :src="invaderCaptain" alt="Invader" class="custom-icon ma-2" />
    Jakmile se na žebříku ocitne Kapitán, je možné jej zranit a zničit jen pokud přiběhnou
  žebřík bránit všichni obránci, kteří umí shazovat ze žebříku (takže ne obránce s dělem). <strong>Jinak je Kapitán nezranitelný</strong>.</p>

  <h3 class="mb-2 text-h5">Vaše zbraně</h3>

  <p>I bez zbraně můžete tím, že budete stát nad žebříkem, zraňovat nepřátele. Také můžete vyzvednout vroucí olej z kovárny,
  pokud je již připraven. Olej musí vždy nést dva obránci.</p>

  <p>S Mečem máte stejné možnosti, jako beze zbraně, ale navíc si v kovárně můžete zvolit vylepšení Ostrý meč.</p>

  <p>Dělostřelec nemůže shazovat útočníky, kteří již započali výstup po žebříku. Může ovšem ostřelovat shromažďovací
  prostor před žebříkem. Kliknutím na shromažďovací prostor zaměříte, kam vaše dělo vypálí. Nabíjení děla zabere nějaký čas,
  proto važte, kdY a kam se vyplatí střelit. Dělostřelec může z kovárny vyzvednout vroucí olej (musí jej nést dva obránci)</p>

  <h3 class="mb-2 text-h5">Kovárna</h3>

  <p class="mb-2">Jeden region na mapě je označen jako <strong>kovárna</strong>.
    Každý obránce může přijít do Kovárny, kde lze vyzvednout kotel s vroucím olejem. Kotel se musí nějaký
    <strong>čas vařit</strong>, než je možné jej použít. Zvažte proto pečlivě, kdy jej použijete.
    <img :src="cauldronFullIcon" alt="Cauldron" class="custom-icon hh-badge__icon ma-2" />
    Kotel s vroucím olejem musí vyzvednout <strong>naráz dva</strong> hráči a vylít jej také najednou na
    stejném úseku hradeb.
  Pokud olej donesou k nějakému žebříku a vylejí jej, budou zničeni úplně všichni obránci, co zrovna na žebříku jsou.</p>

  <p class="mb-2">Kdo má meč, tak může v kovárně získat ještě speciální vylepšení - naostření meče.
    <v-icon icon="mdi-sword" color="black" class="hh-badge__icon ma-2" size="32px"></v-icon>
    To na chvíli zesílí úder obránce,
    než se otupí.</p>

  <p class="mb-2">Vylepšení z kovárny je možné sbírat opakovaně, pokud jste již předchozí vyčerpali.</p>

  <h3 class="mb-2 text-h5">Schopnosti přehledně</h3>

  <v-table class="border-md my-2">
    <thead>
    <tr>
      <th class="mb-2 text-left font-weight-black">
        Zbraň
      </th>
      <th class="mb-2 text-left font-weight-black">
        v kovárně
      </th>
      <th class="mb-2 text-left font-weight-black">
        zraní útočníka?
      </th>
      <th class="mb-2 text-left font-weight-black">
        zraní kapitána?
      </th>
    </tr>
    </thead>

    <tbody>
    <tr>
      <td>Žádná <br> <img :src="defenderNoWeapon" alt="Invader" class="custom-icon ma-2" /></td>
      <td>vroucí olej</td>
      <td>NA žebříku</td>
      <td>NA žebříku</td>
    </tr>
    <tr>
      <td>Meč <br> <img :src="defenderSword" alt="Invader" class="custom-icon ma-2" /></td>
      <td>vroucí olej; ostrý meč</td>
      <td>NA žebříku</td>
      <td>NA žebříku</td>
    </tr>
    <tr>
      <td>Dělo <br> <img :src="defenderCannon" alt="Invader" class="custom-icon ma-2" /></td>
      <td>vroucí olej</td>
      <td>PŘED žebříkem</td>
      <td>PŘED žebříkem</td>
    </tr>
    </tbody>
  </v-table>
</template>

<style scoped lang="scss">

</style>