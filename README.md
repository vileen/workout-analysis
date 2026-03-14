# Form Analyzer - Analiza Formy Treningowej

[![Deploy to GitHub Pages](https://github.com/vileen/workout-analysis/actions/workflows/deploy.yml/badge.svg)](https://github.com/vileen/workout-analysis/actions/workflows/deploy.yml)

Aplikacja do analizy formy ćwiczeń w czasie rzeczywistym z wykorzystaniem AI (MediaPipe Pose). Uruchamia się na iPhone jako PWA (Progressive Web App).

## 🚀 Live Demo

**GitHub Pages:** https://vileen.github.io/workout-analysis/

## 📱 Jak używać

1. Otwórz link na iPhone w Safari
2. Kliknij "Share" → "Add to Home Screen"
3. Uruchom aplikację z ekranu głównego
4. Ustaw iPhone na statywie 2-3 metry przed Tobą
5. Wybierz ćwiczenie i rozpocznij trening

## 🏋️ Wspierane ćwiczenia

| Ćwiczenie | Poziom | Co analizuje |
|-----------|--------|--------------|
| **Kettle Goblet Squat** | Początkujący | Głębokość, kąt tułowia, symetria kolan |
| **Kettle Swing** | Średni | Hip hinge, proste ramiona, zgięcie kolan |
| **Kettle Row** | Początkujący | Pochylenie tułowia, zakres łokcia, proste plecy |
| **Kettle Press** | Średni | Pionowy tułów, stabilność bioder, blokada |
| **Russian Twist** | Początkujący | Odchylenie tułowia, rotacja, równe barki |

## ✨ Funkcje

- **Analiza w czasie rzeczywistym** - MediaPipe działa lokalnie na urządzeniu
- **Feedback wizualny** - Szkielet z kolorowymi wskazówkami
- **Feedback audio** - Głosowe komendy (wkrótce)
- **Liczenie powtórzeń** - Automatyczne wykrywanie
- **Ocena formy** - Score 0-100 dla każdego repa
- **Wibracje** - Haptic feedback po każdym powtórzeniu
- **Instrukcje** - Szczegółowe wskazówki dla każdego ćwiczenia

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Pose Detection:** MediaPipe Pose (on-device)
- **Styling:** TailwindCSS
- **State:** Zustand
- **Deploy:** GitHub Pages

## 🔧 Development

```bash
# Clone repo
git clone https://github.com/vileen/workout-analysis.git
cd workout-analysis

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## 📋 Wymagania

- iPhone z iOS 14+ (lub Android z Chrome)
- Dostęp do kamery
- Statyw lub uchwyt na telefon
- Dobra iluminacja (działa najlepiej w świetle dziennym)

## 📝 Roadmap

- [x] Podstawowa analiza 5 ćwiczeń kettlebell
- [x] Liczenie powtórzeń dla wszystkich ćwiczeń
- [x] Feedback wizualny (szkielet)
- [x] Instrukcje dla każdego ćwiczenia
- [ ] Audio feedback (głosowe komendy)
- [ ] Historia treningów
- [ ] Statystyki i wykresy postępów
- [ ] Więcej ćwiczeń (pompki, plank, wykroki)
- [ ] Kalibracja kamery do wzrostu
- [ ] Export do Apple Health

## 🤝 Wsparcie

Aplikacja działa lokalnie na urządzeniu - twoje dane nie opuszczają telefonu. MediaPipe procesuje obraz w czasie rzeczywistym bez wysyłania go do chmury.

---

Stworzone z 💪 dla pasjonatów kettlebell
