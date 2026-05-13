# UI Atlas 9-Slice v1

실사용을 위해 텍스트가 없는 UI 베이스 에셋을 새로 구성한 atlas입니다.

## Files

- `atlas/ui-atlas.png`: sprite atlas
- `atlas/ui-atlas.json`: frame 좌표
- `atlas/ui-9slice.json`: 9-slice 정의
- `sprites/`: atlas에서 추출한 개별 PNG 확인용
- `examples/preview.html`: atlas + 9-slice canvas 조립 샘플
- `src/uiAtlas.ts`: TypeScript 타입/유틸
- `src/pixiNineSlice.ts`: PixiJS subtexture helper

## Recommended use

- 패널/버튼/메시지 박스: `ui-9slice.json` 기준으로 9-slice 렌더링
- 아이콘/장식: `ui-atlas.json` frame 기준으로 sprite 렌더링
- 텍스트: HTML/React/Pixi Text로 overlay

