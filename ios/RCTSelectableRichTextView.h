#import <UIKit/UIKit.h>

#import <React/RCTComponent.h>

NS_ASSUME_NONNULL_BEGIN

@interface RCTSelectableRichTextView : UITextView

@property (nonatomic, assign, getter=isSelectable) BOOL selectable;
@property (nonatomic, copy, nullable) NSArray<NSDictionary *> *menuItems;
@property (nonatomic, assign) BOOL showSystemMenuItems;
@property (nonatomic, assign) BOOL clearSelectionOnMenuAction;
@property (nonatomic, copy, nullable) RCTDirectEventBlock onMenuAction;
@property (nonatomic, copy, nullable) NSString *selectionMode;
@property (nonatomic, copy, nullable) RCTDirectEventBlock onTextLongPress;

// setTextStorage 把 Fabric Paragraph state 转换得到的 NSTextStorage 设置到 UITextView，
// 是 RCTSelectableRichTextComponentView 唯一的文本内容入口。
- (void)setTextStorage:(NSTextStorage *)textStorage;

- (void)selectTextRangeWithStart:(NSInteger)start end:(NSInteger)end;
- (void)clearTextSelection;
- (void)copyTextRangeWithStart:(NSInteger)start end:(NSInteger)end;

@end

NS_ASSUME_NONNULL_END
