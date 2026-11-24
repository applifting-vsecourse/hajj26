# Saved — případy

Uživatel si může quack uložit a později ho najít v seznamu **Saved**. Saved je
soukromé: vidí ho jen ten, kdo si quacky uložil.

## Kontrakt

| Co            | Jak                                                                    |
| ------------- | ---------------------------------------------------------------------- |
| Uložit        | `PUT /api/saved/:quackId` → `204` (idempotentní)                       |
| Odebrat       | `DELETE /api/saved/:quackId` → `204` (idempotentní)                    |
| Seznam Saved  | `GET /api/saved` → `200`, quacky přihlášeného, naposledy uložený první |
| Stav ve feedu | `GET /api/quacks` → každý quack má `isSaved` (pro přihlášeného)        |
| UI: uložit    | tlačítko „Save quack“ u každého quacku                                 |
| UI: seznam    | odkaz „Saved“ v hlavičce → stránka `/saved`                            |

Kdo ukládá a čí Saved se čte, se bere vždy ze session, nikdy z požadavku.

## Případy

| ID  | Případ                                                                                   | Původ    |
| --- | ---------------------------------------------------------------------------------------- | -------- |
| S1  | Uložený quack vidím v Saved.                                                             | zadání   |
| S2  | Uložit dvakrát = uložit jednou (v Saved je quack jednou, druhé uložení není chyba).      | zadání   |
| S3  | Cizí Saved nevidím: co si uložil někdo jiný, se v mém Saved neobjeví.                    | zadání   |
| S4  | Saved nejde vyžádat pro jiného uživatele: `GET /api/saved?userId=…` → `400`.             | návrh G  |
| S5  | Quack můžu ze Saved odebrat; odebrání neuloženého quacku není chyba.                     | návrh A  |
| S6  | Saved je seřazené podle času uložení, naposledy uložený nahoře (ne podle vzniku quacku). | otázka 2 |
| S7  | Uložit neexistující quack → `404`.                                                       | návrh B  |
| S8  | Nepřihlášený nemůže ukládat, odebírat ani číst Saved → `401`.                            | návrh C  |
| S9  | Když autor quack smaže, zmizí ze Saved všech, kdo si ho uložili.                         | návrh D  |
| S10 | Uložit si můžu i vlastní quack.                                                          | návrh E  |
| S11 | Ve feedu vidím u quacku, jestli ho mám uložený (`isSaved`) — a to platí jen pro mě.      | návrh F  |
| S12 | Prázdné Saved vrací `[]`, ne chybu.                                                      | návrh H  |

## Testy

- **Unit** (pravidla služby, repozitáře mockované):
  `apps/backend/src/modules/saved/services/saved-quacks.service.spec.ts` —
  `pnpm backend test`
- **Integrační** (chování API přes HTTP proti skutečné testovací databázi
  `<db>_test`): `apps/backend/src/modules/saved/saved.int-spec.ts` —
  `pnpm backend test:int` (potřebuje běžící Postgres)
- **End-to-end** (hlavní průchod v prohlížeči):
  `apps/frontend/e2e/saved.spec.ts` — `pnpm frontend test:e2e` (potřebuje
  běžící aplikaci, `pnpm dev`)

| ID  | Unit | Integrační | E2E |
| --- | :--: | :--------: | :-: |
| S1  |  ✓   |     ✓      |  ✓  |
| S2  |  ✓   |     ✓      |     |
| S3  |  ✓   |     ✓      |     |
| S4  |      |     ✓      |     |
| S5  |  ✓   |     ✓      |     |
| S6  |      |     ✓      |     |
| S7  |  ✓   |     ✓      |     |
| S8  |      |     ✓      |     |
| S9  |      |     ✓      |     |
| S10 |  ✓   |     ✓      |     |
| S11 |      |     ✓      |     |
| S12 |      |     ✓      |     |

Názvy testů začínají ID případu (`S1: …`), takže se dají dohledat grepem.
