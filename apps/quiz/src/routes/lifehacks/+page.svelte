<script lang="ts">
  import { resolve } from '$app/paths';
  import Page from '$lib/components/Page.svelte';
  import { CARDS_BY_VALUE, problemCount } from '$lib/cards';

  let sum = 0;
  const top = CARDS_BY_VALUE.slice(0, 16).map((c) => ({ card: c, n: problemCount(c), total: (sum += problemCount(c)) }));

  const UNITS = [
    ['°C → K', '+ 273'],
    ['L → м³', '× 0.001'],
    ['mL, cm³ → м³', '× 1e-6'],
    ['cm² → м²', '× 1e-4'],
    ['cm → м', '× 0.01'],
    ['mm → м', '× 0.001'],
    ['g → кг', '× 0.001'],
    ['g/mol → кг/моль', '× 0.001'],
    ['atm → Па', '× 101325'],
    ['kJ → Дж', '× 1000'],
    ['час → с', '× 3600'],
    ['сутки → с', '× 86400'],
  ];

  const CONSTANTS = [
    ['R', '8.31'],
    ['k', '1.38e-23'],
    ['Nₐ', '6.022e23'],
    ['g', '9.8'],
    ['c воды', '4186'],
    ['c льда', '2100'],
    ['L плавления', '334000'],
    ['L парообразования', '2256000'],
    ['ρ воды', '1000'],
    ['1 ккал', '4186 Дж'],
  ];
</script>

<svelte:head><title>Лайфхаки · daulet-specifica</title></svelte:head>

<Page narrow>
  <div class="page-header"><h1>Лайфхаки</h1></div>
  <p class="lead">Самый короткий путь: узнал задачу, вспомнил формулу, перевёл единицы, набрал на калькуляторе.</p>

  <h2>План из четырёх шагов</h2>
  <ol>
    <li><b>Зубри карточки сверху вниз</b> в <a href={resolve('/formulas/')}>Формулах</a>. Включи «Спрятать формулы» и отмечай «Выучил».</li>
    <li><b>Гоняй <a href={resolve('/drill/')}>Тренажёр</a></b>, пока не узнаёшь задачу с первого взгляда.</li>
    <li><b>Жми «Решать с новыми числами»</b> на карточке, чтобы рука набивала формулу на калькуляторе.</li>
    <li><b>Сдай пробный <a href={resolve('/')}>Exam</a> три раза подряд.</b> Это 7 задач за 40 минут, по 5 минут на задачу и 5 в запасе.</li>
  </ol>

  <h2>Что зубрить первым</h2>
  <p>Мало времени? Иди по таблице сверху. Счётчик показывает, сколько задач из 150 уже закрыто.</p>
  <div class="scroll">
    <table>
      <thead><tr><th>Карточка</th><th>Задач</th><th>Всего</th></tr></thead>
      <tbody>
        {#each top as t (t.card.id)}
          <tr>
            <td><a href="{resolve('/formulas/')}#{t.card.id}">{t.card.title}</a></td>
            <td>{t.n}</td>
            <td>{t.total}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <h2>Семь правил на экзамене</h2>
  <ol>
    <li><b>Читай последнее предложение первым.</b> Условия повторяются, а вопрос меняется: в P9 просят «mass of liquid», а в P10 «still unmelted».</li>
    <li><b>Сначала переведи всё в СИ</b>, потом подставляй. Забытые литры или граммы сдвигают ответ в 1000 раз.</li>
    <li><b>Нужна ли +273?</b> В разности ΔT не нужна. Когда T стоит одна, в дроби, под корнем или в ln, нужна.</li>
    <li><b>Лишние числа игнорируй.</b> Масса груза в P30, моли в P54, молярная масса в P70 и объём в P62 для ответа не нужны.</li>
    <li><b>Знак.</b> Тепло отдал: минус. Получил: плюс. Написано «magnitude» или «absolute value»: минус убери.</li>
    <li><b>Записывай минимум 4 значащие цифры</b> и не забудь единицу.</li>
    <li><b>Застрял на минуту? Поставь флажок и иди дальше.</b> Вернёшься к задаче в конце, когда лёгкие уже решены.</li>
  </ol>

  <h2>Перевод единиц</h2>
  <div class="grid">
    {#each UNITS as [from, to] (from)}
      <div class="fact"><span>{from}</span><b>{to}</b></div>
    {/each}
  </div>

  <h2>Константы</h2>
  <p>Обычно они есть в условии. Если нет, вот они.</p>
  <div class="grid">
    {#each CONSTANTS as [name, value] (name)}
      <div class="fact"><span>{name}</span><b>{value}</b></div>
    {/each}
  </div>

  <h2>Как вводить ответ</h2>
  <ul>
    <li>Большие и малые числа пиши через e: <code>1.27e22</code>, <code>2.93e-5</code>.</li>
    <li>Единицу пиши в том же поле: <code>0.0916 m</code>. На этом сайте сравнивается и число, и единица.</li>
    <li>Если в условии «Answer in kelvins», ответ в K. Если «Answer without units», единицу не пиши.</li>
  </ul>

  <p class="note">Как оценивает настоящий экзамен, уточни у преподавателя.</p>
</Page>

<style>
  .lead { color: #495057; }
  h2 { margin-top: 1.75rem; font-size: 1.3rem; }
  .scroll { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 0.45rem 0.5rem; border-bottom: 1px solid #dee2e6; text-align: left; }
  th:not(:first-child), td:not(:first-child) { width: 4rem; text-align: right; }
  li { margin-bottom: 0.4rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr)); gap: 0.5rem; }
  .fact { display: flex; justify-content: space-between; gap: 0.5rem; padding: 0.45rem 0.6rem; border: 1px solid #dee2e6; border-radius: 0.375rem; }
  .fact span { color: #495057; }
  .note { margin-top: 1.5rem; color: #495057; font-size: 0.875rem; }
</style>
