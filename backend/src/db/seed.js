require('dotenv').config();
const pool = require('../config/db');

async function seed() {
  // ── Countries ──────────────────────────────────────────────────────────────
  await pool.query(`
    INSERT INTO countries (code, name_en, name_he, lat, lng, flag_url) VALUES
      ('POL', 'Poland',         'פולין',          52.237049,  21.017532, 'https://flagcdn.com/pl.svg'),
      ('GBR', 'United Kingdom', 'הממלכה המאוחדת', 51.509865,  -0.118092, 'https://flagcdn.com/gb.svg'),
      ('USA', 'United States',  'ארצות הברית',    38.895111, -77.036667, 'https://flagcdn.com/us.svg')
    ON CONFLICT (code) DO NOTHING
  `);
  const { rows: countries } = await pool.query(
    `SELECT id, code FROM countries WHERE code = ANY($1)`,
    [['POL', 'GBR', 'USA']]
  );
  const countryMap = Object.fromEntries(countries.map(c => [c.code, c.id]));

  // ── Soldiers ───────────────────────────────────────────────────────────────
  await pool.query(`
    INSERT INTO soldiers
      (reference_code, name_en, name_he, birth_date, birth_location_en, birth_location_he,
       biography_en, biography_he, army_en, army_he, rank_en, rank_he, role_en, role_he,
       death_date, death_location_en, death_location_he)
    VALUES
      ('SOL-00001', 'David Cohen',   'דויד כהן',    '1920-03-15', 'Warsaw, Poland',   'ורשה, פולין',
       'David Cohen was born in Warsaw and emigrated to Britain in 1938. He served with distinction in the Royal Fusiliers during the North Africa campaign.',
       'דויד כהן נולד בורשה ועלה לבריטניה ב-1938. שירת בכבוד בגדוד המלכותי במסע הצפון-אפריקני.',
       'British Army', 'הצבא הבריטי', 'Sergeant', 'סמל', 'Infantryman', 'חייל רגלים',
       '1944-06-06', 'Normandy, France', 'נורמנדי, צרפת'),

      ('SOL-00002', 'Abraham Levy',  'אברהם לוי',   '1915-07-22', 'Krakow, Poland',   'קרקוב, פולין',
       'Abraham Levy fought in the Polish Army before the German invasion of 1939. He later joined the Free Polish Forces and served in Italy.',
       'אברהם לוי נלחם בצבא הפולני לפני הפלישה הגרמנית ב-1939. לאחר מכן הצטרף לכוחות הפולנים החופשיים ושירת באיטליה.',
       'Polish Army', 'הצבא הפולני', 'Lieutenant', 'סגן', 'Platoon Commander', 'מפקד מחלקה',
       NULL, NULL, NULL),

      ('SOL-00003', 'Samuel Goldberg','שמואל גולדברג','1922-11-08', 'New York, USA',    'ניו יורק, ארה"ב',
       'Samuel Goldberg enlisted in the US Army in 1942 and served in the 82nd Airborne Division, participating in the D-Day jump over Normandy.',
       'שמואל גולדברג התגייס לצבא האמריקאי ב-1942 ושירת בדיביזיית המוט ה-82, השתתף בקפיצת יום D מעל נורמנדי.',
       'US Army', 'הצבא האמריקאי', 'Private First Class', 'רב-טוראי', 'Paratrooper', 'צנחן',
       NULL, NULL, NULL),

      ('SOL-00004', 'Moshe Katz',    'משה כץ',      '1910-02-19', 'Lodz, Poland',     'לודז, פולין',
       'Moshe Katz was a decorated officer who served in the Polish reserve forces and was one of the commanders during the defense of Warsaw in 1939.',
       'משה כץ היה קצין מעוטר ששירת בכוחות המילואים הפולנים והיה אחד המפקדים בהגנת ורשה ב-1939.',
       'Polish Army', 'הצבא הפולני', 'Captain', 'קפטן', 'Company Commander', 'מפקד פלוגה',
       '1939-09-27', 'Warsaw, Poland', 'ורשה, פולין'),

      ('SOL-00005', 'Isaac Stern',   'יצחק שטרן',   '1918-05-30', 'London, UK',       'לונדון, בריטניה',
       'Isaac Stern served with the Royal Air Force as a navigator aboard Lancaster bombers, completing 32 operational sorties over occupied Europe.',
       'יצחק שטרן שירת בחיל האוויר המלכותי כנווט על מפציצי לנקסטר, השלים 32 גיחות מבצעיות מעל אירופה הכבושה.',
       'Royal Air Force', 'חיל האוויר המלכותי', 'Flight Officer', 'קצין תעופה', 'Navigator', 'נווט',
       NULL, NULL, NULL)
    ON CONFLICT (reference_code) DO NOTHING
  `);
  const { rows: soldiers } = await pool.query(
    `SELECT id, reference_code FROM soldiers WHERE reference_code = ANY($1)`,
    [['SOL-00001', 'SOL-00002', 'SOL-00003', 'SOL-00004', 'SOL-00005']]
  );
  const soldierMap = Object.fromEntries(soldiers.map(s => [s.reference_code, s.id]));

  // ── Soldier ↔ Country links ────────────────────────────────────────────────
  if (Object.keys(soldierMap).length > 0 && Object.keys(countryMap).length > 0) {
    await pool.query(`
      INSERT INTO soldier_countries (soldier_id, country_id, relationship_type) VALUES
        ($1, $2, 'birth'),   -- Cohen: born in Poland
        ($1, $3, 'service'), -- Cohen: served in UK army
        ($4, $2, 'birth'),   -- Levy: born in Poland
        ($4, $3, 'service'), -- Levy: served in UK (Free Polish via GBR)
        ($5, $6, 'birth'),   -- Goldberg: born in USA
        ($5, $6, 'service'), -- Goldberg: served in US army
        ($7, $2, 'birth'),   -- Katz: born in Poland
        ($7, $2, 'death'),   -- Katz: died in Poland
        ($8, $3, 'birth'),   -- Stern: born in UK
        ($8, $3, 'service')  -- Stern: served in UK RAF
      ON CONFLICT DO NOTHING
    `, [
      soldierMap['SOL-00001'],  // $1 Cohen
      countryMap['POL'],         // $2 Poland
      countryMap['GBR'],         // $3 UK
      soldierMap['SOL-00002'],  // $4 Levy
      soldierMap['SOL-00003'],  // $5 Goldberg
      countryMap['USA'],         // $6 USA
      soldierMap['SOL-00004'],  // $7 Katz
      soldierMap['SOL-00005'],  // $8 Stern
    ]);

    // ── Soldier participations ───────────────────────────────────────────────
    await pool.query(`
      INSERT INTO soldier_participations (soldier_id, type, name_en, name_he, display_order) VALUES
        ($1, 'participation', 'North Africa Campaign', 'מסע צפון אפריקה',      0),
        ($1, 'participation', 'Normandy Landings',     'נחיתות נורמנדי',        1),
        ($1, 'decoration',    'Military Medal',        'מדליה צבאית',            0),
        ($2, 'participation', 'Defense of Warsaw',     'הגנת ורשה',              0),
        ($2, 'participation', 'Italian Campaign',      'המסע האיטלקי',           1),
        ($3, 'participation', 'D-Day Airborne Drop',   'צניחת יום D',            0),
        ($3, 'decoration',    'Bronze Star',           'כוכב הארד',              0),
        ($4, 'participation', 'Defense of Warsaw',     'הגנת ורשה',              0),
        ($4, 'decoration',    'Virtuti Militari',      'ויירטוטי מיליטארי',       0),
        ($5, 'participation', 'Bombing Campaign Europe','מסע ההפצצות באירופה',   0),
        ($5, 'decoration',    'Distinguished Flying Cross','צלב טיסה מצטיין',    0)
      ON CONFLICT DO NOTHING
    `, [
      soldierMap['SOL-00001'],
      soldierMap['SOL-00002'],
      soldierMap['SOL-00003'],
      soldierMap['SOL-00004'],
      soldierMap['SOL-00005'],
    ]);
  }

  // ── Events ─────────────────────────────────────────────────────────────────
  if (Object.keys(countryMap).length > 0) {
    await pool.query(`
      INSERT INTO events (title_en, title_he, start_date, end_date, description_en, description_he, country_id) VALUES
        ('German Invasion of Poland',
         'הפלישה הגרמנית לפולין',
         '1939-09-01', '1939-10-06',
         'Germany invaded Poland on 1 September 1939, triggering the start of World War II in Europe. The campaign lasted 35 days and resulted in the occupation of Poland.',
         'גרמניה פלשה לפולין ב-1 בספטמבר 1939, ומשכה את תחילת מלחמת העולם השנייה באירופה. הקמפיין נמשך 35 ימים וגרר את כיבוש פולין.',
         $1),

        ('Warsaw Ghetto Uprising',
         'מרד גטו ורשה',
         '1943-04-19', '1943-05-16',
         'Jewish resistance fighters in the Warsaw Ghetto staged an armed uprising against Nazi deportation transports. It was the largest Jewish uprising during the Holocaust.',
         'לוחמי התנגדות יהודים בגטו ורשה ביצעו מרד חמוש נגד רכבות הגירוש הנאציות. זה היה המרד היהודי הגדול ביותר בשואה.',
         $1),

        ('D-Day — Normandy Landings',
         'יום D — נחיתות נורמנדי',
         '1944-06-06', NULL,
         'Allied forces launched Operation Overlord, the largest seaborne invasion in history, landing over 150,000 troops on the beaches of Normandy, France.',
         'כוחות בעלות הברית שיגרו את מבצע אוברלורד, הפלישה הימית הגדולה ביותר בהיסטוריה, ונחתו עם למעלה מ-150,000 חיילים על חופי נורמנדי, צרפת.',
         $2),

        ('Liberation of Paris',
         'שחרור פריז',
         '1944-08-25', NULL,
         'Paris was liberated from German occupation after four years. Free French forces entered the city on 25 August 1944, greeted by jubilant crowds.',
         'פריז שוחררה מהכיבוש הגרמני לאחר ארבע שנים. כוחות צרפת החופשית נכנסו לעיר ב-25 באוגוסט 1944 בתוך קהל עולץ.',
         $2)
      ON CONFLICT DO NOTHING
    `, [countryMap['POL'], countryMap['GBR']]);
  }

  // ── Media ──────────────────────────────────────────────────────────────────
  const { rows: eventRows } = await pool.query(`SELECT id FROM events LIMIT 4`);
  if (eventRows.length > 0 && Object.keys(soldierMap).length > 0) {
    await pool.query(`
      INSERT INTO media (entity_type, entity_id, media_type, url, caption_en, caption_he, display_order) VALUES
        ('soldier', $1, 'image', 'https://example.com/media/cohen-portrait.jpg',
         'David Cohen in uniform, 1943', 'דויד כהן במדים, 1943', 0),
        ('soldier', $2, 'image', 'https://example.com/media/levy-portrait.jpg',
         'Abraham Levy, Free Polish Forces, 1942', 'אברהם לוי, כוחות פולין החופשיים, 1942', 0),
        ('event',   $3, 'image', 'https://example.com/media/dday-landing.jpg',
         'Allied troops landing on Omaha Beach, June 6 1944', 'חיילים בעלות הברית נוחתים על חוף אומהה, 6 ביוני 1944', 0)
      ON CONFLICT DO NOTHING
    `, [
      soldierMap['SOL-00001'],
      soldierMap['SOL-00002'],
      eventRows[2]?.id || eventRows[0].id,
    ]);
  }

  await pool.end();
  console.log('Seed complete: 3 countries, 5 soldiers, 4 events, 3 media records.');
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
