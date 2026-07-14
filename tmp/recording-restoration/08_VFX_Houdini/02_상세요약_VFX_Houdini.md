# 상세 요약: The First Descendant Unreal Engine 5 시네마틱 Houdini 활용기

## 문서 정보

- 형식: NDC 2026 기술 발표 및 질의응답
- 발표: 김준영, 넥슨게임즈 매그넘 스튜디오 VFX 아티스트
- 대상: The First Descendant 트레일러·인게임 컷신 VFX 제작
- 요약 기준: 기술 용어와 작업 순서를 교정한 복원본
- 핵심 범위: 페이셜 메시 매칭, Particle VAT 물보라, 군중 최적화, skeletal animation·VAT 혼합, coverage 기반 셰이딩

## 전체 핵심 요약

이 발표는 The First Descendant의 트레일러와 Unreal Engine 5 인게임 컷신을 제작하며 만난 VFX 문제를 Houdini와 Unreal의 조합으로 해결한 다섯 사례를 다룬다. 핵심 철학은 모든 것을 Houdini에서 완성하거나 모든 것을 실시간 엔진에 맡기는 것이 아니다. 형상 분석, 시뮬레이션, 데이터 베이크처럼 Houdini가 강한 작업과 카메라 의존 배치, 재생 제어, material 표현, 반복 수정처럼 Unreal이 강한 작업을 나누어 전체 제작 비용과 런타임 비용을 동시에 줄이는 것이다.

첫 사례는 페이셜 애니메이션이 적용된 얼굴에 입체적인 상처나 회복용 메시를 붙이는 문제다. 단순히 본이나 버텍스에 이펙트 메시를 연결하면 피부 변형을 따라가지 못해 미끄러진다. 더 어려운 점은 얼굴 표정이 본 애니메이션이 아니라 여러 blend shape의 혼합으로 만들어진다는 것이다. 새 메시를 붙이면 토폴로지와 버텍스 번호가 바뀌어 기존 blend shape가 참조하던 위치가 깨진다.

해결은 얼굴 표면의 위치를 안정적인 속성으로 다시 정의하는 것이다. Houdini에서 source primitive와 source primitive UV를 가진 tracking point를 만들고 Attribute Interpolate로 피부에 고정한다. 볼륨이 있는 상처 덩어리는 Point Deform으로 포인트가 메시를 끌고 가게 하고, 원래 얼굴과 거의 겹치는 피부 조각은 Ray를 통해 직접 표면 좌표를 얻는다. 각 저장 표정에 같은 처리를 적용해 blend shape를 다시 구성하고 본 데이터까지 합쳐 FBX로 내보내면 Unreal에서도 볼의 미세한 떨림을 따라가는 입체 상처를 얻을 수 있다.

두 번째 사례는 가까운 카메라에서도 입자감이 살아 있는 포말과 물보라다. Sprite는 해상도 한계가 있고 dynamic remesh VAT는 세밀한 형상일수록 텍스처 크기가 급증한다. 발표자는 Particle VAT를 택해 Water Tank의 유체 시뮬레이션으로 기본 물보라를 만든 뒤, 위로 튀는 particle만 velocity 기준으로 그룹화해 whitewater simulation의 emitter로 다시 사용했다. 이 두 단계는 바닥에 고인 물을 칼로 자른 듯 제거하지 않고 필요한 splash만 자연스럽게 분리한다.

Particle VAT는 기본 motion blur가 없기 때문에 Houdini에서 계산한 velocity를 color texture로 베이크하고 Unreal material에서 이동 방향과 blur 길이를 복원했다. Motion blur는 particle 사이의 빈 공간을 메우고 덩어리의 입체감을 높여 낮은 해상도와 적은 particle 수에서도 품질을 끌어올린다. 완성된 리소스는 Niagara에서 spawn하고, 수면의 출렁임만 떼어 포말 decal처럼 사용할 수 있다. 잔잔한 물과 폭포처럼 성격이 다른 효과는 전용 리소스를 따로 만드는 것이 좋지만, 하나를 공용으로 써야 한다면 Niagara에서 Z축을 압축하거나 필요한 프레임만 분리할 수 있다.

세 번째 사례는 콘서트 컷신의 군중 최적화다. 많은 인원을 skeletal mesh로 모두 재생할 수 없어 VAT로 애니메이션을 변환했다. Houdini 방식과 Unreal의 AnimToTexture 플러그인을 비교한 결과 플러그인이 텍스처 한 장을 더 사용해도 전체 용량과 성능 면에서 더 유리했다. 발표자는 도구에 대한 선호보다 실제 장면의 비용을 기준으로 플러그인을 선택하고 Houdini는 간단한 전처리에만 사용했다.

군중 VAT의 핵심은 애니메이션 길이와 버텍스 수다. 원본 애니메이션을 2~4배 빠르게 압축해 텍스처 길이를 줄이고, Unreal material에서 다시 느리게 재생했다. 느리게 되돌리며 생기는 끊김은 프레임 보간으로 완화했다. 모든 군중이 같은 타이밍에 춤추는 문제는 Niagara dynamic parameter로 time offset을 주어 해결했다. Local space 배치에서 actor scale을 키우면 메시까지 커지는 문제는 Scratch Pad에서 크기 영향은 제거하고 위치 간격만 늘어나게 했다. 카메라 거리 LOD를 적용하자 프레임을 약 두 배 확보했다.

네 번째 사례는 캐릭터의 skeletal animation과 VFX의 VAT animation을 분리해 제어하는 방식이다. 일반적인 컷신 VFX는 캐릭터 애니메이션에 맞춰 이펙트를 통째로 베이크한다. 이후 애니메이션이 조금만 바뀌어도 Houdini에서 이펙트를 다시 맞추고 VAT를 재생성해야 한다. 수정 횟수가 늘수록 왕복 비용이 커진다.

발표자는 VAT가 static mesh에서 작동한다는 일반적 전제를 바꾸어 이펙트 메시를 skeletal mesh와 결합했다. 몸의 움직임은 animator가 만든 본 애니메이션을 따르고, 빗물의 흐름이나 전기·기생충의 꿈틀거림만 VAT parameter로 독립 제어한다. 빗물 속도를 늦춰도 캐릭터의 몸동작은 느려지지 않고, 애니메이션이 수정돼도 이펙트 전체를 다시 베이크할 필요가 줄어든다. 얼굴 효과에는 앞서 만든 페이셜 매칭을 추가하고, 팔의 전기에는 본 캡처 데이터를 이식해 전체 위치는 팔을 따라가되 세부 움직임은 VAT로 제어한다.

다섯 번째 사례는 coverage 속성을 활용한 rim light와 환경색 표현이다. Houdini에서 좋은 형상을 만들어도 실제 장면의 조명과 카메라 각도에 따라 이펙트가 어둡거나 평평해 보일 수 있다. 메시 외곽의 coverage 영역을 계산해 별도 attribute로 만들고, VAT position texture에서 비어 있는 alpha channel에 저장한다. 추가 texture를 만들지 않고 Unreal material에서 reflection, normal, opacity에 사용할 수 있다.

Coverage 값을 외곽 rim light에 쓰면 환경 조명과 관계없이 실루엣과 입체감이 살아난다. Opacity에 쓰면 중앙이 얇은 막처럼 비치는 느낌을 만들 수 있고, 반대로 coverage 영역에 환경색을 입혀 주변에 자연스럽게 섞이게 할 수도 있다. Houdini에서 look을 미리 확인하되 동일한 계산을 Unreal에서 할 수 있다면 최종 연산은 엔진에 남기는 것이 효율적이다.

질의응답에서는 제작 파이프라인과 AI, 물 리소스의 범용성, 엔진 전용 작업이 다뤄졌다. 발표자는 다른 팀의 HDA·PDG 파이프라인은 정확히 알지 못해 추정하지 않았고, 생성형 AI가 현재 VFX 결과물을 직접 대신하기보다 VEX 같은 코드 작성에 도움을 줄 가능성을 언급했다. 물보라와 실제 수면의 완전한 매칭은 고정 카메라 컷신에서는 생략하고 화면에서 자연스럽게 보이는 배치를 우선했다. 상처가 사라지고 살이 차오르는 최종 표현은 Houdini가 아니라 Unreal material에서 조절했다.

전체 발표가 보여 주는 실무 원칙은 ‘베이크할 것과 실시간으로 남길 것을 구분하라’는 것이다. 변하지 않는 복잡한 시뮬레이션과 표면 매칭은 Houdini에서 계산하고, 연출 변화가 잦거나 샷마다 달라지는 속도·색·투명도·배치는 Unreal parameter로 남긴다. 텍스처 채널 재사용, 애니메이션 길이 축소, LOD, particle 수 절감 같은 작은 결정이 합쳐져 고품질 컷신을 실시간 예산 안에 넣는다.

## 주제별 논지

### 1. Houdini와 Unreal의 역할 분담

Houdini는 복잡한 형상 관계, 유체와 particle simulation, attribute 생성, 대량 표정 처리에 강하다. Unreal은 material parameter, Niagara 배치, 카메라 기준 튜닝, 실시간 LOD와 반복 수정에 강하다. 한 도구로 끝내려 하면 수정 왕복과 런타임 비용이 커질 수 있다.

작업 초기에 어떤 데이터가 제작 중 고정되고 무엇이 연출 단계에서 자주 바뀌는지 분류해야 한다. 고정되는 계산은 베이크하고, 자주 바뀌는 요소는 엔진 parameter로 노출한다.

### 2. 토폴로지 변화와 페이셜 데이터

Blend shape는 대응하는 버텍스 구조가 유지된다는 전제 위에서 동작한다. 얼굴에 새 메시를 붙이거나 기존 메시를 바꾸면 버텍스 번호가 달라져 표정 데이터가 깨진다. 단순 Attribute Transfer만으로 해결되지 않는 이유다.

Source primitive와 UV를 이용한 표면 좌표는 토폴로지 변화 뒤에도 위치 관계를 다시 구성하는 기준이 된다. Point Deform은 부피가 있는 이펙트 메시를, Ray와 Interpolate는 표면에 가까운 메시를 다루는 데 적합하다.

### 3. Particle VAT의 품질 대 용량

Dynamic remesh는 물 표면을 직접 표현해 품질이 높지만 텍스처와 프레임 비용이 커진다. Particle VAT는 훨씬 작은 데이터로 물보라를 표현할 수 있지만 particle 사이가 비어 보이고 motion blur가 자동으로 나오지 않는다.

Velocity를 texture에 저장해 motion blur를 복원하면 낮은 particle 수의 한계를 시각적으로 보완할 수 있다. 품질을 유지하면서 데이터 비용을 줄이는 핵심은 단순 압축이 아니라 부족해진 정보를 shader에서 재구성하는 것이다.

### 4. 두 단계 시뮬레이션의 목적

첫 fluid simulation은 물의 전체 운동을 만들고, 두 번째 whitewater simulation은 위로 튀는 요소만 추출한다. 단순한 geometry cut은 부자연스러운 경계를 만들지만 particle을 새 emitter로 사용하면 필요한 splash를 자연스럽게 재생성할 수 있다.

이 방식은 결과물을 통째로 가져오기보다 목적에 맞는 운동 성분만 분리하는 접근이다. 엔진 예산에 맞춰 particle 수를 줄일 때도 중요한 실루엣과 방향성을 유지하기 쉽다.

### 5. 군중 애니메이션 압축

VAT 텍스처 비용은 버텍스 수와 프레임 수에 직접 영향을 받는다. 애니메이션을 빠르게 재생해 저장 프레임을 줄이고, 엔진에서 다시 느리게 재생하면 메모리를 절약할 수 있다. 이때 보간이 없으면 끊김이 생기므로 material 보간과 품질 확인이 필요하다.

모든 동작이 같은 타이밍이면 군중이 복제물처럼 보인다. Time offset, 위치 랜덤, LOD를 함께 사용해야 성능과 다양성을 동시에 얻는다.

### 6. 도구 선택은 결과로 검증

발표자는 Houdini 사용자이지만 군중 VAT에서는 AnimToTexture를 선택했다. 텍스처 장수만 보면 플러그인이 불리해 보여도 실제 총용량과 런타임 비용이 더 낮았기 때문이다.

파이프라인은 도구 충성도가 아니라 품질, 수정성, 메모리, 제작 시간의 합으로 결정해야 한다. Houdini는 필요한 전처리에만 남겨도 가치가 있다.

### 7. Local space와 scale 문제

Niagara를 local space로 두면 actor 이동과 배치가 편하지만 scale도 particle mesh에 전달된다. 군중 간격만 넓히고 사람 크기는 유지하려면 위치와 크기에 대한 transform 영향을 분리해야 한다.

Scratch Pad에서 mesh size가 actor scale을 받지 않게 하고 위치만 확장하면 레이아웃 조절이 쉬워진다. 실시간 툴에서는 편의 기능이 예상치 못한 변형을 만드는지 확인해야 한다.

### 8. Skeletal animation과 VAT의 혼합

캐릭터와 이펙트를 하나의 VAT로 베이크하면 동기화는 쉽지만 수정성이 낮다. 몸동작과 빗물 속도를 독립적으로 바꿀 수 없다. Skeletal mesh에 VAT 데이터를 결합하면 큰 움직임과 세부 효과의 시간축을 분리할 수 있다.

이는 반복 수정이 많은 컷신에 특히 유리하다. Animator가 몸동작을 수정해도 VFX artist는 전체를 다시 만들지 않고 필요한 부착과 parameter만 점검할 수 있다.

### 9. Texture channel 패킹

Coverage 데이터를 별도 texture로 만들지 않고 position texture의 비어 있는 alpha에 저장한 것은 작은 최적화지만 대량 리소스에서는 효과가 크다. GPU texture fetch와 메모리, 관리 자산 수를 줄인다.

채널 패킹을 할 때는 값 범위, 정밀도, 압축 포맷, 다른 기능과의 충돌을 문서화해야 한다. 비어 있다고 가정한 채널이 나중에 다른 기능에 사용되면 파이프라인 충돌이 생길 수 있다.

### 10. Coverage 기반 셰이딩

Coverage는 메시 외곽이나 곡률에 가까운 영역을 마스크로 제공한다. Rim light, reflection, normal, opacity, 환경색에 각각 다른 방식으로 조합하면 동일한 geometry에서 다양한 look을 만들 수 있다.

이 방식은 조명이 바뀌어도 효과의 실루엣을 유지하고, 가운데가 얇은 막처럼 보이는 비현실적 소재도 표현한다. 시뮬레이션 데이터에 셰이딩용 정보를 함께 베이크하는 사례다.

### 11. 컷신은 카메라 기준으로 최적화할 수 있다

실시간 플레이와 달리 컷신은 카메라와 타이밍이 통제된다. 물보라가 물리적으로 모든 수면과 완전히 맞지 않아도 최종 카메라에서 자연스럽다면 별도 시뮬레이션 매칭을 생략할 수 있다.

다만 재사용 리소스인지 단일 샷용인지 구분해야 한다. 범용 리소스에는 다양한 시점과 환경을 견디는 보정이 필요하고, 단일 샷은 화면 결과와 제작 속도를 우선할 수 있다.

### 12. 생성형 AI의 현실적인 적용점

발표 시점에는 생성형 AI가 Houdini VFX를 직접 대체하기보다 VEX 코드 작성과 반복 스크립트에 도움을 줄 가능성이 더 현실적이라고 봤다. 이는 결과물 생성보다 작업자의 표현 능력을 보조하는 사용이다.

AI가 만든 코드는 geometry와 attribute 문맥을 이해한 검증이 필요하다. 노드 그래프와 엔진 결과를 함께 확인해야 하며, 성능과 재현성을 자동으로 보장하지 않는다.

## 주요 사례

- 얼굴 표면 tracking point와 source primitive UV로 상처 메시가 blend shape를 따라가게 했다.
- Fluid simulation의 상승 particle만 whitewater emitter로 재사용해 자연스러운 splash를 분리했다.
- Velocity를 color texture로 베이크해 Particle VAT의 motion blur를 material에서 복원했다.
- 군중 VAT는 AnimToTexture, 애니메이션 길이 압축, frame interpolation, time offset, LOD를 결합했다.
- Skeletal animation은 몸동작을, VAT는 빗물·전기·기생충의 세부 움직임을 독립 제어했다.
- Coverage를 position texture alpha에 저장해 rim light, 투명도, 환경색을 추가 texture 없이 만들었다.
- 고정 카메라 컷신의 물보라는 실제 수면 완전 매칭보다 화면에서 자연스러운 배치를 우선했다.
- 상처 회복의 geometry 매칭은 Houdini에서, 사라짐과 살이 차오르는 연출은 Unreal material에서 처리했다.

## 실무적 시사점

1. 에셋마다 고정 계산과 반복 조정 요소를 나눠 Houdini 베이크와 Unreal parameter의 경계를 정한다.
2. Blend shape에 geometry를 추가할 때 버텍스 번호 의존성을 먼저 점검한다.
3. Source primitive·UV 같은 안정적 표면 좌표를 남겨 이펙트 메시의 부착 기준으로 사용한다.
4. Particle VAT는 velocity와 motion blur 복원까지 포함해 품질을 평가한다.
5. 전체 시뮬레이션을 잘라 쓰기보다 목적 particle을 emitter로 재시뮬레이션해 자연스러운 경계를 만든다.
6. 군중 리소스는 버텍스, 프레임, 텍스처, LOD를 함께 측정하고 실제 장면 비용으로 도구를 선택한다.
7. Local space 편의 기능이 mesh scale에 미치는 영향을 분리해 검증한다.
8. 캐릭터와 VFX의 시간축을 분리하면 애니메이션 수정에 따른 재베이크 비용을 줄일 수 있다.
9. 비어 있는 texture channel은 메타데이터와 셰이딩 마스크에 재사용하되 포맷을 문서화한다.
10. 단일 컷신 리소스와 범용 게임플레이 리소스의 정확도·재사용 기준을 다르게 잡는다.
11. AI 코딩 보조 결과는 노드 문맥, 성능, 엔진 호환성을 사람이 검증한다.
12. 최적화 전후에는 메모리뿐 아니라 프레임, 품질, 수정 시간까지 함께 비교한다.

## 불확실성 주의사항

- 발표자 소속 세부 영문 조직명과 페이셜 표정 개수는 PDF 음성 인식만으로 완전히 확정하지 못했다.
- 노드 이름과 연결 순서는 발표 음성을 기준으로 복원했으며, 실제 재현에는 원본 슬라이드와 프로젝트 설정 확인이 필요하다.
- 텍스처 크기와 프레임 향상 수치는 발표 장면의 비교 결과이므로 모든 캐릭터와 플랫폼에 동일하게 적용되지 않는다.
- 2019년 SIGGRAPH 참고 자료의 정확한 세션명은 확인하지 못했다.
