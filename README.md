# @boomsi/react-native-selectable-text

Selectable rich text for React Native New Architecture/Fabric apps.

This package is a breaking-change New Architecture-only implementation. It does not ship a Paper manager, Paper shadow view, or legacy native module command path.

## Requirements

- React Native `>=0.85.0`
- React `19.2.x`
- iOS `15.1+`
- Android `minSdkVersion >= 24`
- New Architecture/Fabric enabled

## Installation

```sh
yarn add @boomsi/react-native-selectable-text
```

For iOS, install pods after adding the package:

```sh
cd ios && pod install
```

## Usage

```tsx
import React from 'react';
import {Text} from 'react-native';
import {
  SelectableRichText,
  type SelectableRichTextRef,
} from '@boomsi/react-native-selectable-text';

export function ArticleText() {
  // selectableTextRef 调用 Fabric commands 控制原生选区和剪贴板。
  const selectableRichTextRef = React.useRef<SelectableRichTextRef>(null);

  return (
    <SelectableRichText
      ref={selectableRichTextRef}
      menuItems={[{id: 'quote', title: 'Quote'}]}
      onMenuAction={event => {
        console.log(event.nativeEvent);
      }}>
      <Text style={{fontWeight: '700'}}>Selectable </Text>
      <Text style={{color: '#2f6fed'}}>rich text</Text>
    </SelectableRichText>
  );
}
```

## Props

- `selectable?: boolean` defaults to `true`.
- `menuItems?: Array<{ id: string; title: string }>` adds custom native selection menu items.
- `showSystemMenuItems?: boolean` defaults to `true`; set `false` to hide system items where the platform allows it.
- `clearSelectionOnMenuAction?: boolean` defaults to `false`.
- `selectionMode?: 'default' | 'menuThenParagraph'` defaults to `'default'`.
- `style?: StyleProp<TextStyle>` supports RN Text/Paragraph styling through Fabric Paragraph state.
- `children` must be a text subtree: strings, numbers, nested `Text`, fragments, or components that render text.

`View` children are intentionally rejected in JS because native text selection treats embedded views as attachments, which cannot preserve character-range selection semantics.

## Events

`onMenuAction` fires when a custom menu item is tapped:

```ts
{
  id: string;
  title: string;
  selectedText: string;
  selectionStart: number;
  selectionEnd: number;
}
```

`onTextLongPress` fires in `selectionMode="menuThenParagraph"` when a long press hits a non-empty paragraph:

```ts
{
  paragraphText: string;
  selectionStart: number;
  selectionEnd: number;
  locationX: number;
  locationY: number;
  pageX: number;
  pageY: number;
}
```

## Ref Commands

- `selectRange(start, end)` selects a UTF-16 range and opens the native selection menu.
- `clearSelection()` clears the native selection.
- `copyRange(start, end)` copies a UTF-16 range to the system clipboard.

## `menuThenParagraph`

In `selectionMode="menuThenParagraph"`, the first long press does not enter native selection. The native view calculates the paragraph range and emits `onTextLongPress`; JS can show an app menu and then call `selectRange`, `copyRange`, or `clearSelection` through the ref.

Long pressing empty text, an empty line, or blank space does not emit the paragraph event.

## Development

```sh
yarn typecheck
yarn lint
yarn prepare
yarn example build:android
cd example/ios && pod install
yarn example build:ios
```

The example app is configured for New Architecture/Fabric.

## License

MIT
