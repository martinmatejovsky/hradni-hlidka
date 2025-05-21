  <script setup lang="ts">
import cauldronFullIcon from "assets/icons/cauldron-full.svg";
import invaderStandard from "assets/icons/invader-regular-3.svg";
import invaderCaptain from "assets/icons/invader-captain.svg";
import defenderNoWeapon from "assets/icons/defender-no-weapon-me.svg";
import defenderSword from "assets/icons/defender-swordsman-me.svg";
import defenderCannon from "assets/icons/defender-cannon-me.svg";
import bombardingTargetAim from "assets/icons/target-zone-aim.svg";
</script>

<template>
  <h2 class="mb-2 text-h4">Jak hrát Hradní hlídku</h2>

  <article class="mb-6">
    <h3 class="mb-2 text-h5">Na vaše pozice se dobývají nepřátelé!</h3>

    <p class="mb-2">Jste hlídka na hradě, který se chystají dobýt nepřátelé. Přistavili si pod hradby žebříky, po kterých
      se pomalu šplhají nahoru. Vaším úkolem je nedovolit, aby šplhající se nepřátelé dolezli po žebříku až na hradby a tím
      dobyli váš hrad.
    </p>
  </article>

  <article class="mb-6">
    <h3 class="mb-2 text-h5">Jak nápor nepřátel odrazit?</h3>

    <p class="mb-2">Jste obráncem, členem Hradní Hlídky, který se může libovolně pohybovat po prostoru hradeb či hradu.
      Pokud vstoupíte do
      zvýrazněné oblasti, kde je opřený žebřík s nepřáteli, automaticky jsou <strong>lezoucí</strong> nepřátelé zraňováni,
      až jsou po chvíli uplně zničeni.
    </p>

    <img :src="invaderStandard" alt="Invader" class="custom-icon ma-2" />

    <p class="mb-2">Je třeba pohybovat se mezi ohroženými úseky hradeb a odrážet nápor nepřátel dle situace. Pokud nepřítel
      vyleze na nejvyšší stupeň žebříku, běda! Hrad je dobyt a hra končí.

     Automatické zraňování neplatí pro obránce s dělem - dělo naopak může ostřelovat jen nepřátele, co stojí teprve
      <strong>před</strong> žebříkem. Obránce s dělem se proto nemusí pohybovat vůbec.
      Mapu je možno zvětšit přes celou obrazovku tlačítkem vlevo nahoře.
    </p>
  </article>

  <article class="mb-6">
    <h3 class="mb-2 text-h5">Kapitán</h3>

    <img :src="invaderCaptain" alt="Invader" class="custom-icon ma-2" />

    <p class="mb-2">
      Kapitáni budou také zkoušet vzít hradby ztečí. Je to váš nejsilnějsí nepřítel, proto je pro jeho
      zneškodnění třeba, aby se
      každý aktivní obránce (kromě obránce s dělem) přemístil k žebříku, po kterém kapitán leze.
      Pouze společnými silami ho lze zničit, jinak je Kapitán nezranitelný.
    </p>
  </article>

  <article class="mb-6">
    <h3 class="mb-2 text-h5">Vaše zbraně</h3>

    <ul class="mb-2">
      <li><strong>Žádná zbraň</strong> - pokud jste obránce beze zbraně, můžete nepřátele zraňovat tím, že
        budete stát nad žebříkem. Můžete v kovárně vyzvednout vroucí olej. Musíte se podílet na zničení kapitána,
        který leze po žebříku.
      </li>

      <li><strong>Meč</strong> - pokud máte meč, můžete nepřátele zraňovat tím, že budete stát nad žebříkem.
        V kovárně smíte vyzvednout vroucí olej a nechat si naostřit meč. Musíte se podílet na zničení kapitána,
        který leze po žebříku.
      </li>

      <li><strong>Dělo</strong> - pokud máte dělo, nemůžete zranit nepřátele na žebříku a je jedno, kde stojíte.
        Nepřátele ničíte ostřelováním shromažďovacího prostoru před žebříkem. Počkejte na nabití děla, klikněte
        na mapě na cíl, a vystřelte.

        <img :src="bombardingTargetAim" alt="Target" class="custom-icon ma-2 d-block" width="60px" height="60px" />
        V kovárně smíte vyzvednout vroucí olej. Nemůžete se podílet na zničení kapitána, který leze po žebříku.
      </li>
    </ul>
  </article>

  <article class="mb-6">
    <h3 class="mb-2 text-h5">Kovárna</h3>

    <p class="mb-2">
      Je to místo na hradě, kam si během dobývání můžete opakovaně dojít pro:
    </p>

    <ul>
      <li>
        <img :src="cauldronFullIcon" alt="Cauldron" class="custom-icon hh-badge__icon d-block ma-3" />
        Kotel s vroucím olejem - Vroucí olej lze vylít na žebřík a tím zničit všechny nepřátelé, kteří po něm
        právě lezou. Kotel s olejem musí vyzvednout naráz dva obránci, ve dvojici jej odnést na úsek
        bráněných hradeb a vylít. To provedete otočením telefonu vzhůru nohama nebo kliknutím
        na ikonku kotle s olejem.
        Olej se musí též nějaký čas vařit, než je v Kovárně připraven, zvažte proto pečlivě, kdy jej použijete.
      </li>

      <li>
        <v-icon icon="mdi-sword" color="black" class="hh-badge__icon d-block ma-3" size="32px"></v-icon>
        Naostření meče - pouze pokud máte jako zbraň meč. Nepřátelé budou zraňováni mnohem silněji. Časem se meč
        otupí a účinnost se vrátí na původní.
      </li>
    </ul>
  </article>

  <article class="mb-6">
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
  </article>
</template>