/* ═════ DONNÉES PAR DÉFAUT ═════ */
const PRODUITS_DEF=[
{id:'gin_beef',n:'Gin Beefeater',i:'🍸',u:'cl',ct:70,pc:15.40,s:210,seuil:70,px:0.22,z:'bar',fo:'France Boissons',dlc:0},
{id:'gin_gvine',n:'Gin G\'Vine',i:'🍸',u:'cl',ct:70,pc:29.40,s:140,seuil:70,px:0.42,z:'bar',fo:'France Boissons',dlc:0},
{id:'gin_hend',n:'Hendrick\'s',i:'🍸',u:'cl',ct:70,pc:33.60,s:140,seuil:70,px:0.48,z:'bar',fo:'France Boissons',dlc:0},
{id:'vodka_abs',n:'Absolut',i:'🍶',u:'cl',ct:70,pc:14.70,s:280,seuil:70,px:0.21,z:'bar',fo:'France Boissons',dlc:0},
{id:'vodka_gg',n:'Grey Goose',i:'🍶',u:'cl',ct:70,pc:32.20,s:140,seuil:70,px:0.46,z:'bar',fo:'France Boissons',dlc:0},
{id:'rhum_hav3',n:'Havana 3 ans',i:'🥃',u:'cl',ct:70,pc:14.00,s:210,seuil:70,px:0.20,z:'bar',fo:'France Boissons',dlc:0},
{id:'rhum_zac',n:'Zacapa 23',i:'🥃',u:'cl',ct:70,pc:52.50,s:70,seuil:70,px:0.75,z:'bar',fo:'France Boissons',dlc:0},
{id:'tequila',n:'Olmeca / Patrón',i:'🌵',u:'cl',ct:70,pc:26.60,s:140,seuil:70,px:0.38,z:'bar',fo:'France Boissons',dlc:0},
{id:'whisky_jd',n:'Jack Daniel\'s',i:'🥃',u:'cl',ct:70,pc:20.30,s:210,seuil:70,px:0.29,z:'bar',fo:'France Boissons',dlc:0},
{id:'whisky_ta',n:'Talisker',i:'🥃',u:'cl',ct:70,pc:43.40,s:70,seuil:70,px:0.62,z:'bar',fo:'France Boissons',dlc:0},
{id:'aperol',n:'Aperol',i:'🍊',u:'cl',ct:100,pc:14.00,s:300,seuil:100,px:0.14,z:'bar',fo:'France Boissons',dlc:0},
{id:'campari',n:'Campari',i:'🍒',u:'cl',ct:100,pc:17.00,s:200,seuil:100,px:0.17,z:'bar',fo:'France Boissons',dlc:0},
{id:'stgermain',n:'St Germain',i:'🌸',u:'cl',ct:70,pc:30.80,s:140,seuil:70,px:0.44,z:'bar',fo:'France Boissons',dlc:0},
{id:'ricard',n:'Ricard',i:'🌿',u:'cl',ct:100,pc:16.00,s:400,seuil:100,px:0.16,z:'bar',fo:'France Boissons',dlc:0},
{id:'martini',n:'Martini',i:'🍹',u:'cl',ct:100,pc:11.00,s:300,seuil:100,px:0.11,z:'bar',fo:'France Boissons',dlc:0},
{id:'triple',n:'Cointreau',i:'🍊',u:'cl',ct:70,pc:24.50,s:140,seuil:70,px:0.35,z:'bar',fo:'France Boissons',dlc:0},
{id:'sirops',n:'Sirops bar',i:'🧴',u:'cl',ct:100,pc:5.00,s:500,seuil:150,px:0.05,z:'bar',fo:'France Boissons',dlc:365},
{id:'citron',n:'Citrons / limes',i:'🍋',u:'kg',s:9,seuil:4,px:2.60,z:'bar',fo:'France Boissons',dlc:14},
{id:'menthe',n:'Menthe fraîche',i:'🌿',u:'kg',s:0.8,seuil:0.4,px:16.0,z:'bar',fo:'France Boissons',dlc:4},
{id:'fruitrouge',n:'Purée fruits rouges',i:'🫐',u:'kg',s:4,seuil:2,px:7.20,z:'bar',fo:'France Boissons',dlc:120},
{id:'vin_stnico',n:'Chevalerie St Nico',i:'🍷',u:'btl',s:42,seuil:18,px:6.80,z:'cave',fo:'Cave Occitane',dlc:0},
{id:'vin_clape',n:'La Clape rouge',i:'🍷',u:'btl',s:36,seuil:15,px:7.50,z:'cave',fo:'Cave Occitane',dlc:0},
{id:'vin_pic',n:'Pic Saint Loup',i:'🍷',u:'btl',s:24,seuil:10,px:11.5,z:'cave',fo:'Cave Occitane',dlc:0},
{id:'vin_santa',n:'Santa Giulia rosé',i:'🌹',u:'btl',s:48,seuil:20,px:6.20,z:'cave',fo:'Cave Occitane',dlc:0},
{id:'vin_tariq',n:'Tariquet sec blanc',i:'🥂',u:'btl',s:36,seuil:15,px:5.90,z:'cave',fo:'Cave Occitane',dlc:0},
{id:'vin_chardo',n:'Chardonnay 409',i:'🥂',u:'btl',s:30,seuil:12,px:6.10,z:'cave',fo:'Cave Occitane',dlc:0},
{id:'prosecco',n:'Prosecco',i:'🍾',u:'btl',s:24,seuil:10,px:7.40,z:'cave',fo:'Cave Occitane',dlc:0},
{id:'champ_moet',n:'Moët Brut 75cl',i:'🍾',u:'btl',s:12,seuil:6,px:29.0,z:'cave',fo:'Cave Occitane',dlc:0},
{id:'champ_veuve',n:'Veuve Clicquot 75cl',i:'🍾',u:'btl',s:8,seuil:4,px:33.0,z:'cave',fo:'Cave Occitane',dlc:0},
{id:'biere_wawa',n:'Wawa pression',i:'🍺',u:'L',ct:30,pc:72.00,s:120,seuil:40,px:2.40,z:'bar',fo:'France Boissons',dlc:45},
{id:'biere_bete',n:'La Bête pression',i:'🍺',u:'L',ct:20,pc:58.00,s:80,seuil:30,px:2.90,z:'bar',fo:'France Boissons',dlc:45},
{id:'biere_ipa',n:'Eguzki IPA pression',i:'🍺',u:'L',ct:20,pc:64.00,s:60,seuil:25,px:3.20,z:'bar',fo:'France Boissons',dlc:45},
{id:'biere_btl',n:'Bières bouteille',i:'🍺',u:'u',s:96,seuil:36,px:1.35,z:'bar',fo:'France Boissons',dlc:180},
{id:'soft_33',n:'Softs 33cl',i:'🥤',u:'u',s:180,seuil:60,px:0.72,z:'bar',fo:'France Boissons',dlc:180},
{id:'redbull',n:'Red Bull',i:'⚡',u:'u',s:72,seuil:24,px:1.30,z:'bar',fo:'France Boissons',dlc:300},
{id:'jus',n:'Jus de fruits',i:'🧃',u:'cl',ct:100,pc:2.40,s:1200,seuil:400,px:0.024,z:'bar',fo:'France Boissons',dlc:90},
{id:'oranges',n:'Oranges à presser',i:'🍊',u:'kg',s:22,seuil:8,px:1.90,z:'bar',fo:'France Boissons',dlc:14},
{id:'boeuf',n:'Bœuf (steak/burger)',i:'🥩',u:'kg',s:14,seuil:6,px:16.5,z:'cuisine',fo:'Metro',dlc:4},
{id:'magret',n:'Magret de canard',i:'🦆',u:'kg',s:6,seuil:3,px:21.0,z:'cuisine',fo:'Metro',dlc:4},
{id:'poulet',n:'Poulet / fingers',i:'🍗',u:'kg',s:12,seuil:5,px:8.40,z:'cuisine',fo:'Metro',dlc:3},
{id:'saumon',n:'Saumon poke',i:'🐟',u:'kg',s:5,seuil:3,px:19.5,z:'cuisine',fo:'Metro',dlc:2},
{id:'calamar',n:'Calamars',i:'🦑',u:'kg',s:4,seuil:2,px:11.0,z:'cuisine',fo:'Metro',dlc:2},
{id:'jambon',n:'Jambon Serrano',i:'🍖',u:'kg',s:3.5,seuil:1.5,px:24.0,z:'cuisine',fo:'Metro',dlc:20},
{id:'fromage',n:'Fromages assortis',i:'🧀',u:'kg',s:5,seuil:2,px:14.5,z:'cuisine',fo:'Metro',dlc:18},
{id:'mozza',n:'Mozzarella',i:'🧀',u:'kg',s:4,seuil:2,px:8.90,z:'cuisine',fo:'Metro',dlc:10},
{id:'pain_burg',n:'Pains burger',i:'🍞',u:'u',s:80,seuil:30,px:0.55,z:'cuisine',fo:'Metro',dlc:3},
{id:'tortilla',n:'Tortillas / bao',i:'🌮',u:'u',s:120,seuil:40,px:0.38,z:'cuisine',fo:'Metro',dlc:20},
{id:'frites',n:'Frites surgelées',i:'🍟',u:'kg',s:40,seuil:15,px:1.80,z:'cuisine',fo:'Metro',dlc:240},
{id:'salade',n:'Salades / crudités',i:'🥬',u:'kg',s:9,seuil:4,px:3.40,z:'cuisine',fo:'Metro',dlc:4},
{id:'tomate',n:'Tomates',i:'🍅',u:'kg',s:11,seuil:5,px:3.10,z:'cuisine',fo:'Metro',dlc:6},
{id:'avocat',n:'Avocats',i:'🥑',u:'u',s:40,seuil:15,px:1.10,z:'cuisine',fo:'Metro',dlc:5},
{id:'riz',n:'Riz poke',i:'🍚',u:'kg',s:12,seuil:5,px:2.10,z:'cuisine',fo:'Metro',dlc:365},
{id:'oeuf',n:'Œufs',i:'🥚',u:'u',s:120,seuil:48,px:0.29,z:'cuisine',fo:'Metro',dlc:21},
{id:'creme',n:'Crème / mascarpone',i:'🥛',u:'kg',s:8,seuil:3,px:5.60,z:'cuisine',fo:'Metro',dlc:8},
{id:'choco',n:'Chocolat pâtissier',i:'🍫',u:'kg',s:4,seuil:2,px:9.80,z:'cuisine',fo:'Metro',dlc:365},
{id:'glace',n:'Glaces (bacs)',i:'🍨',u:'L',s:18,seuil:8,px:4.30,z:'cuisine',fo:'Metro',dlc:180},
{id:'cafe',n:'Café en grains',i:'☕',u:'kg',s:6,seuil:3,px:14.0,z:'cuisine',fo:'Metro',dlc:180},
{id:'lait',n:'Lait',i:'🥛',u:'L',s:24,seuil:10,px:0.95,z:'cuisine',fo:'Metro',dlc:7}];

const CARTE_DEF=[
{id:'planche',n:'La Planche',i:'🧺',c:'cTapas',k:'food',sv:'soir',pv:25.00,f:{jambon:.12,fromage:.15,tomate:.05,pain_burg:1}},
{id:'assFromage',n:'Assiette fromage',i:'🧀',c:'cTapas',k:'food',sv:'soir',pv:9.50,f:{fromage:.14,pain_burg:.5}},
{id:'assJambon',n:'Assiette jambon',i:'🍖',c:'cTapas',k:'food',sv:'soir',pv:10.50,f:{jambon:.09,pain_burg:.5}},
{id:'calamarR',n:'Calamars romaine',i:'🦑',c:'cTapas',k:'food',sv:'soir',pv:7.00,f:{calamar:.14,citron:.03}},
{id:'fingers',n:'Fingers poulet',i:'🍗',c:'cTapas',k:'food',sv:'soir',pv:8.00,f:{poulet:.16}},
{id:'cornetFrite',n:'Cornet de frites',i:'🍟',c:'cTapas',k:'food',sv:'soir',pv:6.00,f:{frites:.22}},
{id:'trioTacos',n:'Trio de tacos',i:'🌮',c:'cTapas',k:'food',sv:'soir',pv:11.50,f:{poulet:.11,tortilla:3,salade:.04,tomate:.03}},
{id:'baoPoulet',n:'Bao poulet',i:'🥟',c:'cTapas',k:'food',sv:'soir',pv:12.00,f:{poulet:.13,tortilla:2,salade:.04}},
{id:'trioMezze',n:'Trio de mezze',i:'🫓',c:'cTapas',k:'food',sv:'soir',pv:9.00,f:{tomate:.08,salade:.06,tortilla:2}},
{id:'avocadoT',n:'Avocado toast',i:'🥑',c:'cTapas',k:'food',sv:'soir',pv:12.00,f:{avocat:1.5,pain_burg:1,tomate:.04}},
{id:'tataki',n:'Tataki de bœuf',i:'🥩',c:'cTapas',k:'food',sv:'soir',pv:12.00,f:{boeuf:.13,salade:.04}},
{id:'magretTapa',n:'Magret',i:'🦆',c:'cTapas',k:'food',sv:'soir',pv:12.50,f:{magret:.15,salade:.03}},
{id:'wallaceBurger',n:'Wallace Burger',i:'🍔',c:'cTapas',k:'food',sv:'soir',pv:12.00,f:{boeuf:.13,pain_burg:1,fromage:.02}},
{id:'croqSerrano',n:'Croque Serrano',i:'🥪',c:'cTapas',k:'food',sv:'soir',pv:9.50,f:{jambon:.05,fromage:.06,pain_burg:1.5}},
{id:'hotdogCan',n:'Hot dog Canaillou',i:'🌭',c:'cTapas',k:'food',sv:'soir',pv:9.00,f:{poulet:.09,pain_burg:1,fromage:.03}},
{id:'burgerW',n:'Burger du Wallace',i:'🍔',c:'cPlats',k:'food',sv:'midi',pv:17.50,f:{boeuf:.19,pain_burg:1,fromage:.03,salade:.03,tomate:.04,frites:.2}},
{id:'burgerVege',n:'Burger végé',i:'🥬',c:'cPlats',k:'food',sv:'midi',pv:16.50,f:{pain_burg:1,mozza:.06,salade:.05,tomate:.06,avocat:.5,frites:.2}},
{id:'platJour',n:'Plat du jour',i:'🍽️',c:'cPlats',k:'food',sv:'midi',pv:14.50,f:{poulet:.18,frites:.15,salade:.05}},
{id:'steakFrite',n:'Steak frites',i:'🥩',c:'cPlats',k:'food',sv:'midi',pv:9.00,f:{boeuf:.16,frites:.2}},
{id:'nuggets',n:'Nuggets frites',i:'🍗',c:'cPlats',k:'food',sv:'midi',pv:12.00,f:{poulet:.15,frites:.2}},
{id:'croqueM',n:'Croque Monsieur',i:'🥪',c:'cPlats',k:'food',sv:'midi',pv:13.00,f:{jambon:.06,fromage:.07,pain_burg:1.5}},
{id:'croqueMa',n:'Croque Madame',i:'🍳',c:'cPlats',k:'food',sv:'midi',pv:13.50,f:{jambon:.06,fromage:.07,pain_burg:1.5,oeuf:1}},
{id:'wrap',n:'Wrap',i:'🌯',c:'cPlats',k:'food',sv:'midi',pv:14.50,f:{poulet:.13,tortilla:2,salade:.05,tomate:.04,frites:.15}},
{id:'pokeSaumon',n:'Poke bowl saumon',i:'🐟',c:'cPlats',k:'food',sv:'midi',pv:16.50,f:{saumon:.13,riz:.16,avocat:.5,salade:.05}},
{id:'pokeVege',n:'Poke bowl végé',i:'🥗',c:'cPlats',k:'food',sv:'midi',pv:13.00,f:{riz:.16,avocat:1,salade:.08,tomate:.05}},
{id:'saladeBiq',n:'Salade Biquette',i:'🥗',c:'cPlats',k:'food',sv:'midi',pv:14.00,f:{salade:.11,fromage:.08,tomate:.06}},
{id:'saladeTom',n:'Salade tomates mozza',i:'🍅',c:'cPlats',k:'food',sv:'midi',pv:16.00,f:{tomate:.19,mozza:.11,salade:.04}},
{id:'mojito',n:'Mojito',i:'🍸',c:'cCock',k:'drink',sv:'soir',pv:10.00,f:{rhum_hav3:5,menthe:.012,citron:.05,sirops:2}},
{id:'mojitoRoyal',n:'Mojito Royal',i:'👑',c:'cCock',k:'drink',sv:'soir',pv:11.00,f:{rhum_hav3:5,menthe:.012,citron:.05,sirops:2,prosecco:.12}},
{id:'virginMoj',n:'Virgin Mojito',i:'🌿',c:'cCock',k:'drink',sv:'tous',pv:7.00,f:{menthe:.012,citron:.06,sirops:3,soft_33:.5}},
{id:'tiPunch',n:'Ti Punch',i:'🍹',c:'cCock',k:'drink',sv:'soir',pv:10.00,f:{rhum_hav3:6,citron:.04,sirops:1.5}},
{id:'pinaColada',n:'Piña Colada',i:'🥥',c:'cCock',k:'drink',sv:'soir',pv:10.00,f:{rhum_hav3:5,jus:8,creme:.03}},
{id:'daiquiri',n:'Daiquiri',i:'🍸',c:'cCock',k:'drink',sv:'soir',pv:10.00,f:{rhum_hav3:5,citron:.05,sirops:2}},
{id:'cubaLibre',n:'Cuba Libre',i:'🥤',c:'cCock',k:'drink',sv:'soir',pv:10.00,f:{rhum_hav3:5,soft_33:1,citron:.02}},
{id:'maiTai',n:'Mai Tai',i:'🌺',c:'cCock',k:'drink',sv:'soir',pv:10.00,f:{rhum_hav3:4,triple:1.5,citron:.05,jus:4}},
{id:'margarita',n:'Margarita',i:'🍹',c:'cCock',k:'drink',sv:'soir',pv:11.00,f:{tequila:5,triple:2,citron:.06}},
{id:'longIsland',n:'Long Island',i:'🍸',c:'cCock',k:'drink',sv:'soir',pv:11.00,f:{vodka_abs:1.5,gin_beef:1.5,rhum_hav3:1.5,tequila:1.5,triple:1,soft_33:.5,citron:.03}},
{id:'sexBeach',n:'Sex on the Beach',i:'🏖️',c:'cCock',k:'drink',sv:'soir',pv:10.00,f:{vodka_abs:5,jus:8,fruitrouge:.02}},
{id:'cosmo',n:'Cosmopolitan',i:'💗',c:'cCock',k:'drink',sv:'soir',pv:10.00,f:{vodka_abs:4,triple:1.5,citron:.04,fruitrouge:.02}},
{id:'espMartini',n:'Espresso Martini',i:'☕',c:'cCock',k:'drink',sv:'soir',pv:10.00,f:{vodka_abs:4,cafe:.009,sirops:1.5}},
{id:'dryMartini',n:'Dry Martini Gin',i:'🍸',c:'cCock',k:'drink',sv:'soir',pv:11.00,f:{gin_beef:6,martini:1}},
{id:'negroni',n:'Negroni',i:'🟥',c:'cCock',k:'drink',sv:'soir',pv:11.00,f:{gin_beef:3,campari:3,martini:3}},
{id:'americano',n:'Americano',i:'🍊',c:'cCock',k:'drink',sv:'tous',pv:10.00,f:{campari:4,martini:4,soft_33:.3}},
{id:'spritzAp',n:'Spritz Aperol',i:'🧡',c:'cCock',k:'drink',sv:'tous',pv:10.00,f:{aperol:6,prosecco:.15,soft_33:.2}},
{id:'spritzSG',n:'Spritz St Germain',i:'🌸',c:'cCock',k:'drink',sv:'soir',pv:11.00,f:{stgermain:4,prosecco:.15,soft_33:.2}},
{id:'bloodyMary',n:'Bloody Mary',i:'🍅',c:'cCock',k:'drink',sv:'tous',pv:10.00,f:{vodka_abs:5,jus:10,citron:.03}},
{id:'basilSmash',n:'Basil Smash',i:'🌿',c:'cCock',k:'drink',sv:'soir',pv:11.00,f:{gin_gvine:5,menthe:.01,citron:.05,sirops:2}},
{id:'braiseRouge',n:'Braise Rouge',i:'🔥',c:'cCock',k:'drink',sv:'soir',pv:11.00,f:{whisky_jd:4,fruitrouge:.03,citron:.04,sirops:1.5}},
{id:'nuageRose',n:'Nuage Rose',i:'☁️',c:'cCock',k:'drink',sv:'soir',pv:11.00,f:{gin_hend:4,fruitrouge:.03,citron:.04,sirops:1.5}},
{id:'dolceViol',n:'Dolce Violette',i:'💜',c:'cCock',k:'drink',sv:'soir',pv:11.00,f:{gin_gvine:4,fruitrouge:.02,citron:.04,sirops:2}},
{id:'velourTrop',n:'Velour Tropical',i:'🌴',c:'cCock',k:'drink',sv:'soir',pv:12.00,f:{rhum_zac:4,jus:8,citron:.03}},
{id:'yuzuBlossom',n:'Yuzu Blossom',i:'🌼',c:'cCock',k:'drink',sv:'soir',pv:8.50,f:{sirops:4,citron:.06,soft_33:.5}},
{id:'mezcalSour',n:'Mezcal Sour',i:'🌵',c:'cCock',k:'drink',sv:'soir',pv:13.00,f:{tequila:5,citron:.06,sirops:2,oeuf:.5}},
{id:'spritzXL',n:'Spritz Aperol XL 1,5L',i:'🏺',c:'cCock',k:'drink',sv:'soir',pv:35.00,f:{aperol:24,prosecco:.6,soft_33:.8}},
{id:'sgXL',n:'St Germain XL 1,5L',i:'🏺',c:'cCock',k:'drink',sv:'soir',pv:35.00,f:{stgermain:16,prosecco:.6,soft_33:.8}},
{id:'pichetSang',n:'Pichet Sangria',i:'🍷',c:'cCock',k:'drink',sv:'tous',pv:30.00,f:{vin_stnico:.9,triple:4,jus:20,oranges:.25}},
{id:'vHavana3',n:'Verre Havana 3A',i:'🥃',c:'cAlc',k:'drink',sv:'soir',pv:8.00,f:{rhum_hav3:4}},
{id:'vZacapa',n:'Verre Zacapa 23',i:'🥃',c:'cAlc',k:'drink',sv:'soir',pv:13.00,f:{rhum_zac:4}},
{id:'vAbsolut',n:'Verre Absolut',i:'🍶',c:'cAlc',k:'drink',sv:'soir',pv:8.00,f:{vodka_abs:4}},
{id:'vGGoose',n:'Verre Grey Goose',i:'🍶',c:'cAlc',k:'drink',sv:'soir',pv:10.00,f:{vodka_gg:4}},
{id:'vJack',n:'Verre Jack Daniel\'s',i:'🥃',c:'cAlc',k:'drink',sv:'soir',pv:10.00,f:{whisky_jd:4}},
{id:'vTalisker',n:'Verre Talisker',i:'🥃',c:'cAlc',k:'drink',sv:'soir',pv:10.00,f:{whisky_ta:4}},
{id:'vGvine',n:'Verre G\'Vine',i:'🍸',c:'cAlc',k:'drink',sv:'soir',pv:10.00,f:{gin_gvine:4}},
{id:'vHendricks',n:'Verre Hendrick\'s',i:'🍸',c:'cAlc',k:'drink',sv:'soir',pv:11.00,f:{gin_hend:4}},
{id:'vRicard',n:'Ricard',i:'🌿',c:'cAlc',k:'drink',sv:'tous',pv:3.50,f:{ricard:2}},
{id:'dblRicard',n:'Double Ricard',i:'🌿',c:'cAlc',k:'drink',sv:'tous',pv:7.00,f:{ricard:4}},
{id:'vGGRedbull',n:'Grey Goose Red Bull',i:'⚡',c:'cAlc',k:'drink',sv:'soir',pv:13.00,f:{vodka_gg:4,redbull:1}},
{id:'dblJack',n:'Double Jack',i:'🥃',c:'cAlc',k:'drink',sv:'soir',pv:15.00,f:{whisky_jd:8}},
{id:'vStNico',n:'Verre St Nico',i:'🍷',c:'cVins',k:'drink',sv:'tous',pv:4.50,f:{vin_stnico:.14}},
{id:'vClape',n:'Verre La Clape',i:'🍷',c:'cVins',k:'drink',sv:'tous',pv:5.00,f:{vin_clape:.14}},
{id:'vPicStLoup',n:'Verre Pic St Loup',i:'🍷',c:'cVins',k:'drink',sv:'tous',pv:6.00,f:{vin_pic:.14}},
{id:'vSanta',n:'Verre Santa Giulia',i:'🌹',c:'cVins',k:'drink',sv:'tous',pv:4.00,f:{vin_santa:.14}},
{id:'vTariquet',n:'Verre Tariquet',i:'🥂',c:'cVins',k:'drink',sv:'tous',pv:4.00,f:{vin_tariq:.14}},
{id:'vChardo',n:'Verre Chardo 409',i:'🥂',c:'cVins',k:'drink',sv:'tous',pv:4.00,f:{vin_chardo:.14}},
{id:'coupeProse',n:'Coupe Prosecco',i:'🍾',c:'cVins',k:'drink',sv:'tous',pv:5.00,f:{prosecco:.12}},
{id:'coupeChamp',n:'Coupe Champagne',i:'🍾',c:'cVins',k:'drink',sv:'tous',pv:8.50,f:{champ_moet:.12}},
{id:'btStNico',n:'Bt Chevalerie St Nico',i:'🍷',c:'cVins',k:'drink',sv:'tous',pv:25.00,f:{vin_stnico:1}},
{id:'btClape',n:'Bt La Clape rouge',i:'🍷',c:'cVins',k:'drink',sv:'tous',pv:27.00,f:{vin_clape:1}},
{id:'btPicStLoup',n:'Bt Pic St Loup',i:'🍷',c:'cVins',k:'drink',sv:'tous',pv:34.00,f:{vin_pic:1}},
{id:'btSanta',n:'Bt Santa Giulia',i:'🌹',c:'cVins',k:'drink',sv:'tous',pv:24.00,f:{vin_santa:1}},
{id:'btTariquet',n:'Bt Tariquet sec',i:'🥂',c:'cVins',k:'drink',sv:'tous',pv:22.00,f:{vin_tariq:1}},
{id:'btProsecco',n:'Bt Prosecco',i:'🍾',c:'cVins',k:'drink',sv:'tous',pv:26.00,f:{prosecco:1}},
{id:'btMoet',n:'Bt Moët Brut',i:'🍾',c:'cVins',k:'drink',sv:'soir',pv:80.00,f:{champ_moet:1}},
{id:'btVeuve',n:'Bt Veuve Clicquot',i:'🍾',c:'cVins',k:'drink',sv:'soir',pv:85.00,f:{champ_veuve:1}},
{id:'wawa25',n:'Wawa 25cl',i:'🍺',c:'cBieres',k:'drink',sv:'tous',pv:3.60,f:{biere_wawa:.25}},
{id:'wawa50',n:'Wawa 50cl',i:'🍺',c:'cBieres',k:'drink',sv:'tous',pv:6.80,f:{biere_wawa:.5}},
{id:'bete25',n:'La Bête 25cl',i:'🍺',c:'cBieres',k:'drink',sv:'tous',pv:3.80,f:{biere_bete:.25}},
{id:'bete50',n:'La Bête 50cl',i:'🍺',c:'cBieres',k:'drink',sv:'tous',pv:7.50,f:{biere_bete:.5}},
{id:'ipa25',n:'Eguzki IPA 25cl',i:'🍺',c:'cBieres',k:'drink',sv:'tous',pv:4.20,f:{biere_ipa:.25}},
{id:'ipa50',n:'Eguzki IPA 50cl',i:'🍺',c:'cBieres',k:'drink',sv:'tous',pv:8.00,f:{biere_ipa:.5}},
{id:'monaco25',n:'Monaco 25cl',i:'🍹',c:'cBieres',k:'drink',sv:'tous',pv:3.70,f:{biere_wawa:.24,sirops:2}},
{id:'piconB',n:'Picon bière 25cl',i:'🍺',c:'cBieres',k:'drink',sv:'tous',pv:4.00,f:{biere_wawa:.22,triple:2}},
{id:'corona',n:'Corona',i:'🍾',c:'cBieres',k:'drink',sv:'tous',pv:6.00,f:{biere_btl:1,citron:.02}},
{id:'guinness',n:'Guinness',i:'🍺',c:'cBieres',k:'drink',sv:'tous',pv:6.00,f:{biere_btl:1}},
{id:'desperados',n:'Desperados',i:'🍺',c:'cBieres',k:'drink',sv:'tous',pv:6.00,f:{biere_btl:1}},
{id:'coca',n:'Coca Cola 33cl',i:'🥤',c:'cSofts',k:'drink',sv:'tous',pv:3.90,f:{soft_33:1}},
{id:'cocaZero',n:'Coca Zero 33cl',i:'🥤',c:'cSofts',k:'drink',sv:'tous',pv:3.90,f:{soft_33:1}},
{id:'orangina',n:'Orangina',i:'🍊',c:'cSofts',k:'drink',sv:'tous',pv:3.90,f:{soft_33:1}},
{id:'perrier33',n:'Perrier 33cl',i:'💧',c:'cSofts',k:'drink',sv:'tous',pv:3.90,f:{soft_33:1}},
{id:'redbullS',n:'Red Bull',i:'⚡',c:'cSofts',k:'drink',sv:'tous',pv:5.00,f:{redbull:1}},
{id:'diabolo',n:'Diabolo',i:'🥤',c:'cSofts',k:'drink',sv:'tous',pv:3.90,f:{sirops:3,soft_33:.6}},
{id:'jusPresse',n:'Jus pressé orange',i:'🍊',c:'cSofts',k:'drink',sv:'tous',pv:4.50,f:{oranges:.35}},
{id:'jusFruit',n:'Jus de fruits',i:'🧃',c:'cSofts',k:'drink',sv:'tous',pv:3.80,f:{jus:25}},
{id:'theGlace',n:'Thé glacé maison',i:'🧊',c:'cSofts',k:'drink',sv:'tous',pv:4.50,f:{sirops:3,citron:.04}},
{id:'sanPe50',n:'San Pellegrino 50cl',i:'💧',c:'cSofts',k:'drink',sv:'tous',pv:4.50,f:{soft_33:1.2}},
{id:'fondantC',n:'Crème au chocolat',i:'🍫',c:'cDess',k:'food',sv:'tous',pv:7.00,f:{choco:.05,creme:.08,oeuf:1}},
{id:'cheesecake',n:'Cheesecake',i:'🍰',c:'cDess',k:'food',sv:'tous',pv:7.00,f:{creme:.11,oeuf:1,choco:.01}},
{id:'crumble',n:'Crumble aux fruits',i:'🥧',c:'cDess',k:'food',sv:'tous',pv:7.00,f:{fruitrouge:.09,creme:.03}},
{id:'fraisofee',n:'Fraisofée',i:'🍓',c:'cDess',k:'food',sv:'tous',pv:7.00,f:{fruitrouge:.08,creme:.07}},
{id:'cremeBrulee',n:'Crème brûlée',i:'🍮',c:'cDess',k:'food',sv:'tous',pv:7.00,f:{creme:.1,oeuf:2}},
{id:'mousseChoco',n:'Mousse chocolat',i:'🍫',c:'cDess',k:'food',sv:'tous',pv:7.00,f:{choco:.06,oeuf:1.5,creme:.04}},
{id:'cafeGourm',n:'Café gourmand',i:'☕',c:'cDess',k:'food',sv:'tous',pv:7.00,f:{cafe:.009,choco:.02,creme:.04,glace:.05}},
{id:'glace2b',n:'Glace 2 boules',i:'🍨',c:'cDess',k:'food',sv:'tous',pv:5.00,f:{glace:.12}},
{id:'glace3b',n:'Glace 3 boules',i:'🍨',c:'cDess',k:'food',sv:'tous',pv:7.00,f:{glace:.18}},
{id:'cafeLiegeois',n:'Café liégeois',i:'🍨',c:'cDess',k:'food',sv:'tous',pv:9.00,f:{glace:.15,cafe:.008,creme:.05}},
{id:'crepeNut',n:'Crêpe Nutella',i:'🥞',c:'cDess',k:'food',sv:'tous',pv:4.00,f:{oeuf:.5,lait:.08,choco:.03}},
{id:'cafeExp',n:'Café',i:'☕',c:'cCafe',k:'drink',sv:'tous',pv:1.90,f:{cafe:.008}},
{id:'doubleCafe',n:'Double café',i:'☕',c:'cCafe',k:'drink',sv:'tous',pv:3.80,f:{cafe:.016}},
{id:'noisette',n:'Noisette',i:'☕',c:'cCafe',k:'drink',sv:'tous',pv:2.10,f:{cafe:.008,lait:.02}},
{id:'cafeCreme',n:'Café crème',i:'☕',c:'cCafe',k:'drink',sv:'tous',pv:4.00,f:{cafe:.009,lait:.15}},
{id:'cappuccino',n:'Cappuccino',i:'☕',c:'cCafe',k:'drink',sv:'tous',pv:4.00,f:{cafe:.009,lait:.14,creme:.02}},
{id:'latte',n:'Latte',i:'🥛',c:'cCafe',k:'drink',sv:'tous',pv:4.50,f:{cafe:.009,lait:.22}},
{id:'the',n:'Thé',i:'🍵',c:'cCafe',k:'drink',sv:'tous',pv:4.00,f:{sirops:.5}},
{id:'chocoChaud',n:'Chocolat chaud',i:'🍫',c:'cCafe',k:'drink',sv:'tous',pv:4.20,f:{choco:.03,lait:.2}},
{id:'irishCoffee',n:'Irish Coffee',i:'🥃',c:'cCafe',k:'drink',sv:'soir',pv:11.00,f:{whisky_jd:4,cafe:.009,creme:.04}}];

const CATS=['cTapas','cPlats','cCock','cVins','cBieres','cSofts','cAlc','cDess','cCafe'];
const UNITES=['cl','ml','L','kg','g','u','btl','carton'];
const MOTIFS=[{id:'vente',i:'🧾',ap:'tous'},{id:'offClient',i:'🎁',ap:'tous'},{id:'offPart',i:'🤝',ap:'tous'},
{id:'offGroupe',i:'👥',ap:'tous'},{id:'casse',i:'💥',ap:'tous'},{id:'perso',i:'🍽️',ap:'food'},
{id:'rate',i:'🔥',ap:'food'},{id:'degus',i:'🥄',ap:'tous'},{id:'entame',i:'🍾',ap:'drink'},
{id:'annul',i:'↩️',ap:'tous'}];   /* rattachée automatiquement à la vente correspondante */
const TABLES=['T04','T12','T07','T21','T03','T15','T09','BAR','T18','T06','TERR 2','TERR 5'];
const POSTES=[{id:'admin',i:'⌘',n:'Administrateur',resp:true},{id:'gestion',i:'📊',n:'Gestion',resp:true},{id:'direction',i:'◈',n:'Direction',resp:true},
{id:'salle',i:'🧑‍💼',n:'Responsable de salle',resp:true},{id:'chef',i:'👨‍🍳',n:'Chef de cuisine',resp:true},
{id:'barman',i:'🍸',n:'Barman',resp:false},
{id:'serveur',i:'🙋',n:'Serveur',resp:false}];
/* Préférence d'affichage uniquement : cette liste ne porte aucun droit d'accès. */
const PROFILS_METIER=[
 {id:'barman',i:'🍸',n:'Barman'},
 {id:'chef',i:'👨‍🍳',n:'Chef de cuisine'},
 {id:'salle',i:'🧑‍💼',n:'Responsable de salle'},
 {id:'gestion',i:'📊',n:'Gestion'}
];
const PROFILS_METIER_IDS=PROFILS_METIER.map(function(p){return p.id});
/* Droits : les responsables voient tout. L'équipe voit Déclarer, Livraisons, Inventaire, Stock (sans prix). */
const DROITS_ONGLETS={admin:['*'],gestion:['*'],direction:['dash','bil','admin','stock','cmd','liv'],salle:['*'],chef:['*'],barman:['dash','dec','liv','stock','inv'],serveur:['dash','dec','liv','stock','inv']};
const estResp=()=>{const p=POSTES.find(x=>x.id===st.whoId);return p?!!p.resp:true};
const peutAccederOnglet=(id,role=st.whoId)=>{const droits=DROITS_ONGLETS[role]||DROITS_ONGLETS.serveur;return droits.includes('*')||droits.includes(id)};
/* Les quantités théoriques et écarts d'inventaire sont réservés à la direction et à la salle. */
const peutVoirEcartsInventaire=()=>['admin','gestion','salle'].includes(st.whoId);
const ONGLETS_RESP=['caisse','bil','admin'];

function administrationVierge(){return{
 version:1,documents:[],invoices:[],anomalies:[],auditLog:[],contracts:[],obligations:[],deadlines:[],emailMessages:[],
 approvalWorkflows:[],approvalRequests:[],expenseCategories:[],accountingCategories:[],cashFlowForecasts:[],
 settings:{taxRates:[5.5,10,20],contractAlertDays:[90,60,30,7],approvalRules:[],
  currentCashBalance:null,cashBalanceUpdatedAt:null,cashWarningThreshold:0,priceIncreaseAlertPercent:10,vatCollectedSource:null,
  mailInbox:{provider:'',address:'',status:'not_configured',autoImport:true,unreadOnly:true,lastSync:null,lastError:''},
  integrations:{ocr:'not_configured',emailInbox:'not_configured',accounting:'not_configured',banking:'not_configured',electronicInvoicing:'not_configured',supplierImport:'not_configured'}}
}}

let st={lang:'fr',who:'Responsable de salle',whoId:'salle',profilMetier:'',stock:{},mv:[],count:{},live:false,modeCaisse:'manuel',modePilote:false,
lastSync:Date.now(),svc:'soir',serviceActif:null,serviceHist:[],prods:null,carte:null,liv:[],invHist:[],inventory:null,photos:{},fournisseurs:[],commandes:[],commandeBrouillons:[],receptionBrouillons:[],legacyTransfers:[],meteo:{ville:'',cache:null},administration:administrationVierge()};
let panier={},panierMotifs={},motif=null,motifsSelectionnes=[],motifLigneEditee=null,motifsOuverts=false,cat='cCock',screen='dash',seenFeed=0,timer=null,sq='',stockTab='mat',fm=null;
let msgDec=null,forcerStock=false;   /* retours de validation sur l'écran Déclarer */
let cartePrix=false,prixEdit={},cartCat='tous';   /* édition groupée des prix de vente */
let livTab='recep',invTab='count',invZone='all',invOrderMode=false,draggedProductId=null,zoneOrderSaveTimer=null,
livForm=null,decPhoto=null,commandeFo='',commandeBrouillonActif=null,fournisseurForm=null,settingsTab='general',userForm=null,
adminTab='overview',adminFilters={search:'',supplier:'',status:'',type:''},adminPages={inbox:1,invoices:1,documents:1,contracts:1,compliance:1},adminRenderVersion=0;

const t=k=>(L[st.lang]&&L[st.lang][k])??L.fr[k]??'—';
const prod=id=>st.prods.find(p=>p.id===id);
const item=id=>st.carte.find(x=>x.id===id);
const fmt=n=>(Math.round(n*100)/100).toFixed(2).replace('.',',');
const fmtQ=n=>(Math.round(n*1000)/1000).toString().replace('.',',');
/* BEVERAGE_BOTTLE_CORE_START */
/* Les recettes peuvent être saisies dans une unité compatible ; le stock conserve l’unité du produit. */
const UNIT_BASE={ml:{f:'vol',n:1},cl:{f:'vol',n:10},L:{f:'vol',n:1000},g:{f:'mass',n:1},kg:{f:'mass',n:1000}};
function qteUnite(v,de,vers){const q=num(v),a=UNIT_BASE[de],b=UNIT_BASE[vers];return !a||!b||a.f!==b.f?q:q*a.n/b.n}
function unitesCompatibles(u){const a=UNIT_BASE[u];return a?UNITES.filter(x=>UNIT_BASE[x]&&UNIT_BASE[x].f===a.f):[u]}
function unitesFiche(c,p){return c&&c.k==='drink'&&p&&p.bottle?['cl','ml']:unitesCompatibles(p?.u||'')}
function uniteFiche(c,pid){const p=prod(pid);return(c&&c.fu&&c.fu[pid])||(c&&c.k==='drink'&&p&&p.bottle?(p.ctu||'cl'):(p?.u||''))}
function qteFicheEnStock(c,pid,q){
 const p=prod(pid),u=uniteFiche(c,pid);
 if(c&&c.k==='drink'&&p&&p.bottle&&(u==='cl'||u==='ml')){
  const contenuMl=qteUnite(p.ct,p.ctu||'cl','ml');
  return contenuMl>0?qteUnite(q,u,'ml')/contenuMl:0;
 }
 return qteUnite(q,u,p?.u||'');
}
function migrerUnitesBoissons(){
 let change=false;
 const utiliseEnBoisson=pid=>(st.carte||[]).some(c=>c.k==='drink'&&c.f&&c.f[pid]!==undefined);
 st.prods.forEach(p=>{
  if(p.bottleVersion===1)return;
  const ancienCl=p.u==='cl'&&num(p.ct)>0&&((p.z||'')==='bar'||(p.z||'')==='cave'||utiliseEnBoisson(p.id));
  const ancienneBouteille=p.u==='btl';
  if(!ancienCl&&!ancienneBouteille)return;
  p.bottle=true;p.bottleVersion=1;p.bottleRecipeLegacyUnit=ancienCl?'cl':'btl';
  p.ct=num(p.ct)||(ancienneBouteille?75:0);p.ctu=p.ctu||'cl';p.pc=num(p.pc)||num(p.px);
  if(ancienCl){
   const contenance=num(p.ct)||1;
   p.s=num(p.s)/contenance;p.seuil=num(p.seuil)/contenance;
   if(Object.prototype.hasOwnProperty.call(st.stock,p.id))st.stock[p.id]=num(st.stock[p.id])/contenance;
   if(Object.prototype.hasOwnProperty.call(st.count,p.id)&&st.count[p.id]!==''&&st.count[p.id]!==undefined)st.count[p.id]=num(st.count[p.id])/contenance;
  }
  p.u='btl';p.px=p.pc;change=true;
 });
 st.carte.forEach(c=>{
  if(c.k!=='drink'||c.beverageUnitsVersion===1)return;
  c.fu=c.fu||{};
  Object.keys(c.f||{}).forEach(pid=>{
   const p=prod(pid);if(!p||!p.bottle)return;
   const explicite=c.fu[pid],uniteVolume=explicite==='ml'||p.ctu==='ml'?'ml':'cl';
   if(explicite==='btl'||(!explicite&&p.bottleRecipeLegacyUnit==='btl')){
    c.f[pid]=num(c.f[pid])*qteUnite(p.ct,p.ctu||'cl',uniteVolume);
   }
   c.fu[pid]=explicite==='cl'||explicite==='ml'?explicite:uniteVolume;
  });
  c.beverageUnitsVersion=1;change=true;
 });
 return change;
}
/* BEVERAGE_BOTTLE_CORE_END */
const uid=p=>p+'_'+Math.random().toString(36).slice(2,8);
const rolesValides=roles=>[...new Set((Array.isArray(roles)?roles:[]).filter(id=>POSTES.some(p=>p.id===id)))];
const rolesUtilisateur=u=>{const roles=rolesValides(u&&u.roles);return roles.length?roles:rolesValides([u&&u.role||'gestion'])};
const rolePrincipalUtilisateur=u=>{const roles=rolesUtilisateur(u);return roles.includes(u&&u.role)?u.role:roles[0]||'gestion'};
const estAdministrateurUtilisateur=u=>rolesUtilisateur(u).includes('admin');
const utilisateurConnecte=()=>session&&session.email&&auth.users?auth.users[session.email]:null;
const peutGererRoles=()=>estAdministrateurUtilisateur(utilisateurConnecte());
const rolesTemporairesDisponibles=()=>{const u=utilisateurConnecte(),roles=rolesUtilisateur(u);if(roles.includes('admin'))return POSTES.map(p=>p.id);if(roles.includes('gestion'))return [...new Set([...roles,'barman','serveur'])];return roles};

