# Add CSV Indexワークフロー

[English reference](README.md)

## これは何？

これはCSVファイル内の特定の列に行番号を追加するワークフロー向けのスクリプトです。

多くの規格がある中で、ソフトウェアやゲーム内のテキスト翻訳にはCSVファイルがよく用いられています。<br>
キーやテキストの種類を示す列があっても、しばしばテキストが画面のどこに使われるか推測しづらい場合があります。翻訳後のテキストに行番号を追加する手法がありますが、オリジナルの翻訳ファイルやCAT内のテキストを直接編集すると成果物に混入してしまう恐れがあります。

このワークフローでは行番号付きCSVの自動生成機能を提供します。GitHub ActionsおよびGitLab CIに対応しています。

## 例

### オリジナルのCSV
``` csv
type,en,ja,comment
GREETING,"Hello, $NAME",こんにちは、$NAME,comment test
GREETING,good bye!,さようなら！,
MENU,Start,開始,
MENU,Quit,,
```

### ワークフローにより作成されるCSV
``` csv
type,en,ja,comment
GREETING,"Hello, $NAME",こんにちは、$NAME1,comment test
GREETING,good bye!,さようなら！2,
MENU,Start,開始3,
MENU,Quit,Quit4,
```

> [!NOTE]
> `source`列を設定することで、`MENU,Quit`行の様に翻訳文が空の場合にオリジナルのテキストで埋めることができます。

## 使用方法

### GitHub Actionsの場合

> [!CAUTION]
> GitHub Actionsのワークフローを安全に運用するには、[セキュリティのリファレンス](https://docs.github.com/ja/actions/reference/security)などの公式ドキュメントを参照してください。

以下の様なYAMLファイルを `.github/workflows` 配下に作成します。

``` yaml
on: push
  paths:
    - foo/localization.csv

jobs:
  convert:
    runs-on: ubuntu-latest
    steps:
      - name: checkout
        uses: actions/checkout@v7
        with:
          fetch-depth: 0
      - name: create numbered CSV
        uses: h1data/add-csv-number@v1
        with:
          input: foo/localization.csv
          output: foo/localization_numbered.csv
          columns: 2
          source: 1
      # コミットまたはPR作成処理などを記述
```

`with`で指定するパラメーターについては次節を参照してください。

#### Inputs
- `input`: 入力ファイルパス (必須)<br>
  例) `foo/localization.csv`<br>
- `output`: 出力ファイルパス (必須)<br>
  例) `foo/localization_number.csv`
- `columns`: 行番号を付与する列を指定 (必須、0始まり、複数ある場合はカンマ区切りで指定)<br>
  例) `2`、または `2,3,4` (複数言語向けに複数の翻訳文列がある場合)
- `source`: 指定された場合、対象の列が空白の時に指定された列の文字列で埋めます (0始まり)
- `header`: ヘッダーの有無を指定 (`true` または `false`, 既定値: `true`)
- `encoding`: 文字エンコードを指定 (既定値: `utf8`)
- `utf_bom`: BOM有無を指定 (既定値: `false`)
- `linefeed`: 改行コードを `CRLF` か `LF` で指定 (既定値: `CRLF`)
- `separator`: 列区切り文字列を指定 (既定値: `,`)
- `escape`: CSV列が列区切りを含む場合のエスケープ文字を指定 (既定値: `"`)
- `quote-always`: 必ずエスケープ文字で囲うかどうかを指定 (`true` または `false`、既定値: `false`)

> [!NOTE]
> 言語コード向けとして、`input`と`output`にはワイルドカード`*`が使用できます。`input`または`output`に`*`を使う場合、`input`と`output`両方に`*`を指定する必要があります。

#### Outputs
- output: 作成されたCSVパス
- lines: ヘッダーを除くCSVの行数

### GitLab CIの場合

> [!CAUTION]
> GitLab CIのワークフローを安全に運用するには、[パイプラインセキュリティ](https://docs.gitlab.com/ja-jp/ci/pipeline_security/)などの公式ドキュメントを参照してください。

ソースリポジトリにファイル`.gitlab-ci.yml`を作成します。

``` yaml
convert-csv:
  stage: convert
  image: node:24-alpine3.14
  rules:
    - if: $CI_PIPELINE_SOURCE == "push"
      changes:
        - localization.csv
  variables:
    INPUT_INPUT: foo/localization.csv
    INPUT_OUTPUT: foo/localization_numbered.csv
    INPUT_COLUMNS: "2"
    INPUT_SOURCE: "1"
  before_script:
    - apk add --no-cache curl git
    - git checkout origin main
  script:
    - mkdir -p temp
    - |
      curl --header "PRIVATE-TOKEN: $ACCESS_TOKEN" \
      --url "$CI_API_V4_URL/projects/h1data%2Fadd-csv-index/repository/files/dist%2Fgitlab%2Findex%2Ejs/raw?ref=v1" \
      -o temp/index.js
    - node temp/index.js
    - git add foo/localization_numbered.csv
    - git commit -m "updated numbered CSV"
    - git push origin HEAD
```

パラメーターは先頭に `INPUT_` を付けて大文字で環境変数 (variables) で設定してください。
パラメーターの説明はGitHub向けの[inputs](#inputs)を参照してください。

> [!NOTE]
> APIでスクリプトファイルを取得するには[パーソナルアクセストークン](https://docs.gitlab.com/ja-jp/security/tokens/#personal-access-tokens) (上記例の中の`$ACCESS_TOKEN`) が必要です。<br>
> 参考 https://docs.gitlab.com/ja-jp/api/repository_files/

> [!NOTE]
> GitLab CIコンポーネントを使用するのも一案でしたが、単なるテンプレートでありGitHub Actionsに比べ柔軟性に難があります。<br>
> 例）依然としてjsファイルの取得が必要、`needs` でジョブの実行順を制御できない、GitHub Actionsの `steps` の様にコンポーネントの処理とコミットなど追加の処理を1つのコンテナ内で続けて実行できない、など。<br>
> そのため、上記の様に一連の処理を1つのジョブとして記載することを推奨します。

### コマンドライン

``` sh
# sh
node dist/index.js --input foo/localization.csv --output foo/localization_numbered --columns 2 [options]
```

#### Options
- `--input`: 入力ファイルパス (必須)
- `--output`: 出力ファイルパス (必須)
- `--columns`: 行番号を付与する列を指定 (必須、0始まり、複数ある場合はカンマ区切りで指定)
- `--source`: 対象の列が空白の時に埋める列番号を指定 (0始まり)
- `--no-header`: CSVヘッダーなしとして変換
- `--encoding`: 文字コード (既定値: `utf8`)
- `--utf-bom`: BOMを出力
- `--linefeed`: 改行コード (`CRLF` または `LF`, 既定値: `CRLF`)
- `--separator`: 区切り文字 (既定値: `,`)
- `--escape`: エスケープ文字 (既定値: `"`)
- `--quote-always`: すべての列をクォーテーションで囲む
- `--help`: 使用方法を出力

## 導入方法が分からない、もっとこんなことをしたい、という場合

どうぞ[こちら](https://h1data.github.io/contact/)からご連絡ください。
