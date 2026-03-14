import type { ExerciseInstructions } from '../types/pose';

export const EXERCISE_INSTRUCTIONS: Record<string, ExerciseInstructions> = {
  'kettle-goblet-squat': {
    setup: [
      'Stań w rozkroku na szerokość bioder, palce lekko na zewnątrz',
      'Trzymaj kettlebell przy klatce piersiowej, łokcie wewnątrz',
      'Ustaw kamerę z boku (widok boczny)',
      'Zadbaj o dobre oświetlenie',
    ],
    execution: [
      'Wdech i zagłębienie bioder - jak siadanie na krzesło',
      'Schodź płynnie, kolana idą na zewnątrz (w linii palców)',
      'Hip joint poniżej linii kolana (pełna głębokość)',
      'Wdech i powrót do góry - napnij pośladki',
      'Kolana śledzą kierunek palców przez cały ruch',
    ],
    commonMistakes: [
      'Kolana zapadają się do środka (knee valgus)',
      'Za krótki zakres - nie schodzisz do dołu',
      'Okrogłe plecy - brak napięcia korpusu',
      'Pięty odrywają się od podłogi',
      'Kettlebell opada od klatki',
    ],
    tips: [
      'Wyobraź sobie rozpychanie podłogi nogami',
      'Trzymaj łokcie blisko ciała',
      'Wzrok skierowany lekko do góry, szyja w neutralnej pozycji',
      'Tempo: 3 sekundy w dół, 1 sekunda w górę',
    ],
    muscles: ['Quads', 'Pośladki', 'Ścięgna podkolanowe', 'Core'],
  },

  'kettle-swing': {
    setup: [
      'Stań w rozkroku nieco szerzej niż biodra',
      'Kettlebell przed Tobą na ziemi',
      'Palce lekko na zewnątrz, miękkie kolana',
      'Ustaw kamerę z boku (krytyczne dla tego ćwiczenia)',
    ],
    execution: [
      'Zegnij biodra (hip hinge), plecy proste, klatka otwarta',
      'Chwyć kettlebell i wymachnij między nogami (backswing)',
      'Eksplozywnie wyprostuj biodra - kettlebell leci do góry',
      'Napęd tylko z bioder, ramiona to "lina" (nie ciągniesz)',
      'Kettlebell do pozycji poziomej (ręce proste)',
      'Płynny powrót - kettlebell opada, biodra zginają się',
    ],
    commonMistakes: [
      'Przysiad zamiast hip hinge (za dużo kolan)',
      'Ciągnięcie ramionami - kettle idzie za wysoko',
      'Okrogłe plecy w dolnym punkcie',
      'Niedomknięcie bioder na górze',
      'Zbyt duży wymach (powyżej poziomej)',
    ],
    tips: [
      'Hip hinge to ruch z bochenka (biodra do tyłu)',
      'Ramiona relaks, tylko prowadzą kettlebell',
      'Wdech w dół, wydech przy wybiciu',
      'Mocne zaciskanie pośladków na górze',
    ],
    muscles: ['Pośladki', 'Ścięgna podkolanowe', 'Erektor spinae', 'Core'],
  },

  'kettle-row': {
    setup: [
      'Opcja A: Podparcie ręki o ławkę/krzesło, noga z tyłu wyprostowana',
      'Opcja B: Pozycja wiosłowania w opadzie tułowia bez podparcia',
      'Kettlebell w ręce roboczej, bark nad dłonią',
      'Ustaw kamerę z boku lub z tyłu (zależnie od wariantu)',
    ],
    execution: [
      'Plecy proste, tułów prawie równoległy do podłogi',
      'Łopatka ściągnięta i opuszczona (nie unosisz barku)',
      'Pociągnij kettlebell do biodra - łokieć blisko ciała',
      'Skupienie na ściągnięciu łopatki, nie na ciągnięciu ręką',
      'Kontrolowane opuszczenie - pełne rozciągnięcie',
    ],
    commonMistakes: [
      'Okrągłe plecy - brak neutralnej pozycji kręgosłupa',
      'Rotacja tułowia (wyciąganie barku do przodu)',
      'Łokieć odchodzący od ciała',
      'Za krótki zakres ruchu',
      'Napięcie w barku (podciąganie do ucha)',
    ],
    tips: [
      'Wyobraź sobie ściąganie łopatki do kieszeni',
      'Łokieć prowadzi ruch, nie dłoń',
      'Płaszczyzna ruchu wzdłuż tułowia',
      'Tempo: 2 sekundy w górę, 3 w dół',
    ],
    muscles: ['Grzbiet szeroki', 'Romboidy', 'Biceps', 'Core'],
  },

  'kettle-press': {
    setup: [
      'Czysta pozycja (clean) lub z rack position',
      'Kettlebell przy klatce, łokieć przy tułowiu',
      'Stopy w rozkroku bioder, napięty core',
      'Ustaw kamerę z boku (widok boczny)',
    ],
    execution: [
      'Napięty core, miednica w neutralnej pozycji',
      'Wdech i lekki obrót tułowia (przy pressie jednorącz)',
      'Wyciskanie kettlebell w górę - łokież idzie do boku',
      'Zablokowanie łokcia na górze (ręka prosta)',
      'Stabilizacja - tułów prosto, bez przehyleń',
      'Kontrolowane opuszczenie do rack position',
    ],
    commonMistakes: [
      'Przechylanie się na bok (brak stabilizacji)',
      'Łokieć za daleko od ciała (utrata mocy)',
      'Niedomknięcie na górze (niedopał)',
      'Nadgarstek w zgięciu zamiast prosty',
      'Wypychanie biodra do przodu przy pressie',
    ],
    tips: [
      'Stabilizuj biodra - napnij pośladki i brzuch',
      'Patrz przed siebie, nie na kettlebell',
      'Łokież pod kątem 45° od ciała (nie do przodu, nie na bok)',
      'Oddychaj - wdech w dół, wydech przy pressie',
    ],
    muscles: ['Barki', 'Triceps', 'Core', 'Stabilizatory łopatek'],
  },

  'russian-twist': {
    setup: [
      'Siad z ugiętymi kolanami, pięty na podłodze (lub uniesione dla trudniejszej wersji)',
      'Kettlebell trzymana obiema rękami przed klatką',
      'Tułów odchylony o 30-45° od pionu',
      'Ustaw kamerę z przodu (widok z przodu)',
    ],
    execution: [
      'Odchyl się do tyłu, balans na kościach guzicznych',
      'Napięty core, plecy proste (nie zaokrąglaj)',
      'Rotacja tułowia w prawo - kettlebell przy biodrze',
      'Powrót przez środek i rotacja w lewo',
      'Barki obracają się razem z tułowiem',
      'Stopy na podłodze (lub uniesione 15cm dla progresji)',
    ],
    commonMistakes: [
      'Za bardzo pochylony tułów - plecy się zaokrąglają',
      'Za mała rotacja - tylko ręce się ruszają',
      'Ruch boczny zamiast rotacji (biodra się ruszają)',
      'Napinanie szyi zamiast brzucha',
      'Szybki, niekontrolowany ruch',
    ],
    tips: [
      'Myśl o rotacji, nie o dotykaniu ziemi kettlebell',
      'Wdech w środku, wydech przy rotacji',
      'Wyobraź sobie sznur ciągnący Cię za mostek do góry',
      'Wolniej = lepiej dla mięśni',
    ],
    muscles: ['Mięśnie skośne brzucha', 'Core', 'Hip flexors'],
  },
};
