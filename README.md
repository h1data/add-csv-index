# Add CSV Index Workflow

## What is this?

This is a script for workflows to append indexes as line numbers to CSV files.

Among many standards, CSV is the most common format for translation of software/games.<br>
Even if it has columns for key or context, it's often hard to assume where texts are used. There has been a technique to append line numbers to translated texts, however, there is a risk of contamination to modify the original file or texts in CAT.

This workflow provides automated creation of CSV files with line numbers and is applied for GitHub Actions and GitLab CI.

## Example

### Original CSV
``` csv
type,en,ja,comment
GREETING,"Hello, $NAME",こんにちは、$NAME,comment test
GREETING,good bye!,さようなら！,
MENU,Start,開始,
MENU,Quit,,
```

### CSV created by workflow
``` csv
type,en,ja,comment
GREETING,"Hello, $NAME",こんにちは、$NAME1,comment test
GREETING,good bye!,さようなら！2,
MENU,Start,開始3,
MENU,Quit,Quit4,
```

> [!NOTE]
> For empty columns like `MENU,Quit`, you can fill them with the original text by setting `source` option.

## Usage

### GitHub Actions

> [!CAUTION]
> To secure your workflow on GitHub, see [Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use).

Create a YAML file in `.github/workflows` as follows.

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
      # then commit or make PR or whatever you like
```

See the next section for details of each parameter in `with`.

#### Inputs
- `input`: Input file path (required)<br>
  ex. `foo/localization.csv`<br>
- `output`: Output file path (required)<br>
  ex. `foo/localization_number.csv`
- `columns`: Specifies the columns by number to add line numbers (starts with 0, separated by comma if multiple, required)<br>
  ex. `2`, or `2,3,4` if the file has columns for multiple languages
- `header`: Whether the CSV has header (true/false, default: `true`)
- `encoding`: Specifies encoding (default: `utf8`)
- `utf_bom`: Whether the CSV has BOM (default: false)
- `linefeed`: Specifies linefeed by `CRLF` or `LF` (default: `CRLF`)
- `separator`: Specifies the separator (default: `,`)
- `escape`: Specifies escape character for separators (default: `\"`)
- `quote-always`: Whether if always quote-always (true/false, default: `false`)

> [!NOTE]
> You can use `*` for a wildcard/placeholder as a language code in `input` and `output`. If you use `*` in either `input` or `output`, you have to use it in both parameters.

#### Outputs
- output: the path of the created CSV file
- lines: the number of items in the CSV excluding the header

### GitLab CI

> [!CAUTION]
> To secure your workflow, see [Pipeline security](https://docs.gitlab.com/ci/pipeline_security/) reference.

Create `.gitlab-ci.yml` in your repository.

``` yaml
convert-csv:
  stage: convert
  image: node:24-alpine3.14
  rules:
    - if: $CI_PIPELINE_SOURCE == "push"
      changes:
        - localization.csv
  # Set parameters prefixed `INPUT_` with capital letters
  # as environment variables.
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

See [inputs](#inputs) section of GitHub for parameters.

> [!NOTE]
> Even the script file is in public, you need a personal access token to retrieve it via API.<br>
> see https://github.blog/changelog/2025-05-08-updated-rate-limits-for-unauthenticated-requests/

> [!NOTE]
> Preparing a GitLab CI Component was an option, but it's only a template and not as flexible as GitHub Actions.<br>
> ex. you still need to retrieve js file to run, cannot define job order by `needs`, cannot run component job with user-defined scripts in a single container like `steps` of GitHub Actions, etc.<br>
> Thus it recommends to define a whole job like above.<br>

### CLI

The script has no command line options yet, but you can use with environment variables as follows.
(requires Node.js, of course)

``` sh
# sh
export INPUT_INPUT="foo.csv"
export INPUT_OUTPUT="foo_numbered.csv"
export INPUT_COLUMNS="2"
export INPUT_SOURCE="1"
node dist/gitlab/index.js
export -n INPUT_INPUT
export -n INPUT_OUTPUT
export -n INPUT_COLUMNS
export -n INPUT_SOURCE
```
