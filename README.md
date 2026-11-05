# daulet-specifica

Подготовка к Exam 4: 150 задач, 41 карточка с формулами, тренажёр и лайфхаки.

Основано на [pt-nu-phys161](https://github.com/omgaXD/pt-nu-phys161) от @omgaxd (MIT, см. [LICENSE](LICENSE)).

- `apps/quiz/src/lib/cards.ts`: карточки и строки калькулятора для всех 150 задач.
- `apps/quiz/test/cards.test.ts`: сверяет каждую строку с напечатанным ответом.

```bash
pnpm install
pnpm quiz
```

Публикация: `bash deploy-site.sh` собирает сайт и выкладывает его в ветку `gh-pages` публичного репозитория.
