# Add CSV Digits GitHub Action

## What is this?

This is a simple GitHub Action to adding line number to CSV files.

CSV files are standard in translation for software/games.<br>
Even if it has columns for key or context, it's common to be hard to assume where items are used for.
There has been a technique to append line numbers to translated texts, however,
it is a risk to modify the original file or texts in CAT.

This Action provides automated creation for CSV with digits.

## Example

Original CSV
``` csv
type,en,ja,comment
GREETING,"Hello, $NAME",こんにちは、$NAME,comment test
GREETING,good bye!,さようなら！,
MENU,Start,開始,
MENU,Quit,終了,
```

CSV created by Action
``` csv
type,en,ja,comment
GREETING,"Hello, $NAME",こんにちは、$NAME1,comment test
GREETING,good bye!,さようなら！2,
MENU,Start,開始3,
MENU,Quit,終了4,
```

## Usage

Create a YAML file in `.github/workflows`.

``` yaml
on: push

jobs: Create CSV with digits
  - uses: h1data/add-csv-digits@main
    with:
      input: foo/localization.csv
      output: foo/localization_digits.csv
      columns: 2
```

See [Parameters](#parameters) section for details of each parameter.

## Parameters

### Inputs
- `input`: Input file path (required)<br>
  ex. `foo/localization.csv`
- `output`: Output file path (required)<br>
  ex. `foo/localization_digits.csv`
- `columns`: Specifies the columns by number to add digits (starts with 0, separated by comma if multiple, required)<br>
  ex. `2` or `2,3,4` if the file has columns for multiple languages
- `header`: Whether the CSV has header (true/false)
- `encoding`: Specifies encoding (default: `utf8`)
- `linefeed`: Specifies linefeed by `CRLF` or `LF` (default: `CRLF`)
- `separator`: Specifies the separator (default: `,`)
- `quoting`: Whether if always quoting (true/false)

### Outputs
- output: the path of the created CSV file
- lines: the number of items in the CSV excluding the header
