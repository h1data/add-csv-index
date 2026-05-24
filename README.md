# Append CSV Index GitHub Action

## What is this?

This is a simple GitHub Action to append indexes as line numbers to CSV file.

Among of many standards, CSV files are the most common in translation for software/games.<br>
Even if it has columns for key or context, it's often hard to assume where texts are used for.
There has been a technique to append line numbers to translated texts, however,
it is a risk to modify the original file or texts in CAT.

This GitHub Action provides automated creation for CSV with line numbers.

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

jobs: Create CSV with line numbers
  - uses: h1data/add-csv-number@main
    with:
      input: foo/localization.csv
      output: foo/localization_number.csv
      columns: 2
  # then commit or make PR or whatever you like
```

See [Parameters](#parameters) section for details of each parameter.

## Parameters

### Inputs
- `input`: Input file path (required)<br>
  ex. `foo/localization.csv`
- `output`: Output file path (required)<br>
  ex. `foo/localization_number.csv`
- `columns`: Specifies the columns by number to add line numbers (starts with 0, separated by comma if multiple, required)<br>
  ex. `2` or `2,3,4` if the file has columns for multiple languages
- `header`: Whether the CSV has header (true/false)
- `encoding`: Specifies encoding (default: `utf8`)
- `linefeed`: Specifies linefeed by `CRLF` or `LF` (default: `CRLF`)
- `separator`: Specifies the separator (default: `,`)
- `escape`: Specifies escape character for separators (default: `\"`)
- `quote-always`: Whether if always quote-always (true/false)

### Outputs
- output: the path of the created CSV file
- lines: the number of items in the CSV excluding the header
