# MDS Bridge

[English](./README.md) | [日本語](./README.ja.md)

LLM開発のためのコードベース要約ツール

## 概要

個人開発のプロジェクトでChatGPTやClaudeといったLLMを活用していると、次第にコードベース全体を理解させるのはコンテキスト量的にも大変になってきます。それを解決し、LLMが必要なファイルを容易に渡せるツールです。

## 魅力

LLMを活用した開発では、コードの理解のためにシステムの仕様書やソースコード全体をAIに読み込ませることが一般的です。しかし開発が進むにつれてコードベースは肥大化し、トークン制限に簡単に引っかかってしまいます。そのため、その時々の開発に必要なファイルだけをAIに渡せる仕組みが必要になってきました。

本ツールを使えば、あらかじめLLMにプロジェクトのディレクトリ構造を把握させておき、必要なファイルだけを効率的に共有することができます。また、ローカルサーバーを立ち上げることで、ブラウザから簡単にファイルを取得してAIに渡すことができます。

例えば、こんな感じで活用できます：

```
👤 User: ログイン時に「Invalid credentials」というエラーが出て、ログインできません。
       パスワードは間違いなく正しいはずなのですが...

🤖 Assistant: フロントエンドとバックエンドの認証処理を確認させていただきます。
    まずプロジェクト構造を確認させてください。
http://localhost:3000/view/structure

[構造確認後]
認証周りの実装を確認したいので、フロントエンド側のファイルをお願いします：
http://localhost:3000/view/summarize?patterns=src/hooks/useAuth.ts,src/components/Auth/**/*

[ファイル確認後]
バックエンド側の認証処理も確認させてください：
http://localhost:5120/view/summarize?patterns=src/routes/auth/**/*

[確認完了]
原因が分かりました。フロントエンドからパスワードを送る際のハッシュ化処理と...
```

ユーザーは単にURLをクリックしてコピーボタンを押すだけで、必要なコードをAIに提供できます。AIは既にプロジェクト構造を把握しているため、必要なファイルを的確に指定できます。

## インストール

```bash
npm install -g @chiepu3/mds-bridge
```

## 基本的な使い方

### コマンドラインツール

プロジェクトのサマリーを生成する基本的なコマンドです：

```bash
# カレントディレクトリの要約を生成
mds

# 特定のファイルだけを含める
mds -p "src/**/*.ts"

# 出力先を指定
mds -o summary.md

# ディレクトリ構造のみを出力
mds --structure

# ディレクトリ構造を特定のファイルに出力
mds --structure -o structure.md

# 別のディレクトリを解析
mds ../other-project
```

### サーバーモード

ブラウザからアクセスできるサーバーを起動する：

```bash
# デフォルトポート(3000)で起動
mds-server

# ポートを指定して起動
mds-server -p 8080
```

以下のURLにアクセスできます：
- `http://localhost:3000/view/summarize` - プロジェクトの要約 人力でクエリを指定することで特定のファイルだけを含めることは可能、だけど誰がやるねんそんなこと……。
- `http://localhost:3000/view/structure` - ディレクトリ構造のみ

#### システム指示

面倒くさいので私が使っているシステム指示をそのまま載せておきます。

```markdown
ソースコードを出力する際は、先頭にsrc以下のファイルパスを書いてください。

また、このプロジェクトはこれまで、フロントエンドあるいはバックエンドのすべてのソースコードを常にAIに渡していましたが、開発が進むにつれてコンテキスト量が莫大になったため、あなたが会話開始時点や必要な際にファイルの内容を請求するシステムに変更されました。
会話開始時点で、どのようなファイルが必要そうかを考え、Directory Structureから適切なファイルの中身を要求させることができます。


それぞれで参照したいファイルがある場合、ユーザーに以下のURLへアクセスさせてください。
例: 
src/main.tsxおよびsrc/components/以下のすべてのファイルを取得したい場合、
http://localhost:3000/view/summarize?patterns=src/main.tsx,src/components/**/

利用できる組み合わせ
ファイル単体の指定: src/main.tsx
それ以下のフォルダ・ファイルすべて: src/components/**
不必要なミスを避けるため、少しでも必要そうだと思ったファイルはすべて取得するようにしてください。
/**/*という方法で指定しないでください。

ファイル構造の取得方法
http://localhost:3000/view/structure


バックエンドプロジェクトを取得する場合はポート 5120に、フロントエンドにアクセスするにはポート 3000を指定してください。

一つのURLで、ユーザーがクリックして開ける形式にしてください。
存在しないファイルの指定を行わないでください。
※必ず、必要なソースコードをユーザーから提供されたことを確認してから、コーディングを始めてください。コーディングを始める前に、必要なファイルを参照したか自問自答してください。
```

ポートの異なる2つのサーバーを立てて、フロントエンドとバックエンドのソースコードをそれぞれ取得できるようにしているのがお気に入り。

## カスタマイズ

### 設定ファイル: summarizer.config.json

```json
{
  "port": 3000
}
```

### 除外設定

以下のファイルで除外パターンを指定できます：
- `.gitignore` - Gitの除外設定を自動的に反映
- `.summaryignore` - 追加の除外パターン（`*.md`や`test/**/*`のような指定が可能）

## ライセンス

MIT License - 詳細は[LICENSE](LICENSE)をご覧ください。