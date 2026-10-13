using System;
using System.Collections.Generic;
using System.Reflection;
using ChronoArkMod;
using ChronoArkMod.ModData;
using ChronoArkMod.Template;
using GameDataEditor;

namespace Sizz_Rework
{
    public class SizzReworkModDefinition : ModDefinition
    {
        public override Type ModItemKeysType
        {
            get { return typeof(ModItemKeys); }
        }
    }

    public class SizzReworkCharacterData : CustomCharacterGDE<SizzReworkModDefinition>
    {
        public override string Key()
        {
            return "Sizz_Rework_Sizz";
        }

        public override ModGDEInfo.LoadingType GetLoadingType()
        {
            return ModGDEInfo.LoadingType.Add;
        }

        public override void SetValue()
        {
            Dictionary<string, object> source;
            if (GDEDataManager.Get(GDEItemKeys.Character_Sizz, out source))
            {
                FieldInfo field = typeof(CustomGDE).GetField("gdata", BindingFlags.Instance | BindingFlags.NonPublic);
                Dictionary<string, object> copiedCharacter = new Dictionary<string, object>(source);
                copiedCharacter["KeyID"] = Key();
                field.SetValue(this, copiedCharacter);
            }

            name = "시즈 리워크";
            PassiveClassName = typeof(P_SizzRework).AssemblyQualifiedName;
            PassiveUnlockLV1 = true;
            FixedBasicSkill = "Sizz_Rework_S_Sizz_2";
            Skills = new List<string>
            {
                "Sizz_Rework_S_Sizz_0", "Sizz_Rework_S_Sizz_1", "Sizz_Rework_S_Sizz_2",
                "Sizz_Rework_S_Sizz_3", "Sizz_Rework_S_Sizz_4", "Sizz_Rework_S_Sizz_5",
                "Sizz_Rework_S_Sizz_6", "Sizz_Rework_S_Sizz_7", "Sizz_Rework_S_Sizz_10",
                "Sizz_Rework_S_Sizz_11", "Sizz_Rework_S_Sizz_12", "Sizz_Rework_S_Sizz_13"
            };
            PassiveDes = "턴 시작 시 이브 이동 대상을 선택합니다.\n이브가 시즈에게 있으면 치유력이 10% 증가하고, 초과 회복이 반감되지 않습니다.\n다른 아군에게 이브를 이동하면 즉시 불안이 1중첩됩니다. 턴 종료 시 불안의 중첩에 따라 시즈가 고통 피해를 받습니다. 불안은 최대 3중첩이며, 이브가 돌아오면 즉시 제거됩니다.";
        }
    }

    // 기존 세이브의 시즈 리워크 캐릭터와는 별개로, 원본 시즈 한 자리만 리워크로 교체합니다.
    public class OriginalSizzReworkCharacterData : CustomCharacterGDE<SizzReworkModDefinition>
    {
        public override string Key()
        {
            return GDEItemKeys.Character_Sizz;
        }

        public override ModGDEInfo.LoadingType GetLoadingType()
        {
            return ModGDEInfo.LoadingType.Replace;
        }

        public override void SetValue()
        {
            Dictionary<string, object> source;
            if (!GDEDataManager.Get(GDEItemKeys.Character_Sizz, out source))
            {
                return;
            }

            FieldInfo field = typeof(CustomGDE).GetField("gdata", BindingFlags.Instance | BindingFlags.NonPublic);
            Dictionary<string, object> character = new Dictionary<string, object>(source);
            if (SizzReworkMode.UseOriginalSizzRework())
            {
                character["PassiveClassName"] = typeof(P_SizzRework).AssemblyQualifiedName;
                character["PassiveUnlockLV1"] = true;
                character["FixedBasicSkill"] = "Sizz_Rework_S_Sizz_2";
                character["Skills"] = new List<string>
                {
                    "Sizz_Rework_S_Sizz_0", "Sizz_Rework_S_Sizz_1", "Sizz_Rework_S_Sizz_2",
                    "Sizz_Rework_S_Sizz_3", "Sizz_Rework_S_Sizz_4", "Sizz_Rework_S_Sizz_5",
                    "Sizz_Rework_S_Sizz_6", "Sizz_Rework_S_Sizz_7", "Sizz_Rework_S_Sizz_10",
                    "Sizz_Rework_S_Sizz_11", "Sizz_Rework_S_Sizz_12", "Sizz_Rework_S_Sizz_13"
                };
                character["PassiveDes"] = "턴 시작 시 이브 이동 대상을 선택합니다. 이브가 시즈에게 있으면 치유력이 10% 증가하고, 다른 아군에게 이동하면 즉시 불안이 1중첩됩니다.";
            }
            field.SetValue(this, character);
        }
    }

    public class SizzReworkEveData : CustomBuffGDE<SizzReworkModDefinition>
    {
        public override string Key()
        {
            return "B_SizzRework_Eve";
        }

        public override ModGDEInfo.LoadingType GetLoadingType()
        {
            return ModGDEInfo.LoadingType.Add;
        }
        public override void SetValue()
        {
            Dictionary<string, object> source;
            if (GDEDataManager.Get(GDEItemKeys.Buff_P_Sizz_0, out source))
            {
                FieldInfo field = typeof(CustomGDE).GetField("gdata", BindingFlags.Instance | BindingFlags.NonPublic);
                Dictionary<string, object> copiedEve = new Dictionary<string, object>(source);
                copiedEve["KeyID"] = Key();
                field.SetValue(this, copiedEve);
            }

            ClassName = typeof(B_SizzReworkEve).AssemblyQualifiedName;
            Description = "턴 시작에 공격 기회 1을 얻습니다. 공격 기회는 최대 2입니다. 시즈의 회복 스킬을 적에게 사용하면 공격 기회 1을 소비하여 이브가 해당 적을 공격합니다.";
        }
    }

    // 원본 시즈 리워크와 기존 호환 캐릭터가 같은 파티에 있어도 이브 위치가 충돌하지 않도록 분리합니다.
    public class OriginalSizzReworkEveData : CustomBuffGDE<SizzReworkModDefinition>
    {
        public override string Key()
        {
            return "B_SizzRework_Eve_Original";
        }

        public override ModGDEInfo.LoadingType GetLoadingType()
        {
            return ModGDEInfo.LoadingType.Add;
        }

        public override void SetValue()
        {
            Dictionary<string, object> source;
            if (GDEDataManager.Get(GDEItemKeys.Buff_P_Sizz_0, out source))
            {
                FieldInfo field = typeof(CustomGDE).GetField("gdata", BindingFlags.Instance | BindingFlags.NonPublic);
                Dictionary<string, object> copiedEve = new Dictionary<string, object>(source);
                copiedEve["KeyID"] = Key();
                field.SetValue(this, copiedEve);
            }

            ClassName = typeof(B_SizzReworkEve).AssemblyQualifiedName;
            Description = "턴 시작에 공격 기회 1을 얻습니다. 시즈의 회복 스킬을 적에게 사용하면 이브가 해당 적을 공격합니다.";
        }
    }

    public class StableData : CustomBuffGDE<SizzReworkModDefinition>
    {
        public override string Key()
        {
            return "B_SizzRework_Stable";
        }

        public override ModGDEInfo.LoadingType GetLoadingType()
        {
            return ModGDEInfo.LoadingType.Add;
        }
        public override void SetValue()
        {
            Name = "안정";
            ClassName = typeof(B_SizzReworkStable).AssemblyQualifiedName;
            LifeTime = 0;
            MaxStack = 1;
            Icon = "Image/Buff/Skill_Icon_Pack/3";
            Description = "치유력 +10%. 초과 회복이 반감되지 않습니다.";
        }
    }

    public class AnxietyData : CustomBuffGDE<SizzReworkModDefinition>
    {
        public override string Key()
        {
            return "B_SizzRework_Anxiety";
        }

        public override ModGDEInfo.LoadingType GetLoadingType()
        {
            return ModGDEInfo.LoadingType.Add;
        }

        public override void SetValue()
        {
            Name = "불안";
            ClassName = typeof(B_SizzReworkAnxiety).AssemblyQualifiedName;
            LifeTime = 0;
            MaxStack = 3;
            Icon = "Image/Buff/Skill_Icon_Pack/3";
            Description = "턴 종료 시 고통 피해를 받습니다. 1스택: 5, 2스택: 7, 3스택: 9.";
        }
    }

    public class MoveEveData : CustomSkillGDE<SizzReworkModDefinition>
    {
        public override string Key()
        {
            return "S_SizzRework_MoveEve";
        }

        public override ModGDEInfo.LoadingType GetLoadingType()
        {
            return ModGDEInfo.LoadingType.Add;
        }

        public override void SetValue()
        {
            // 모드 에디터의 소스 목록에서 Sizz_Rework 항목으로 노출합니다.
            PlusSkillView = Key();
            Name = "이브 이동";
            Description = "턴 시작 시 이브를 자신 또는 대상 아군에게 이동시킵니다.";
            User = "Sizz_Rework_Sizz";
            Target = "ally";
            UseAp = 0;
            HealSkill = true;
            NoDrop = true;
            Disposable = true;
            Particle = "Particle/Buff";
            PlusViewBuffList = new List<string>();
            PlusKeyWords = new List<string>();
            SkillExtended = new List<string> { typeof(S_SizzRework_MoveEve).AssemblyQualifiedName };
        }
    }

    public class BorrowSkillData : CustomSkillGDE<SizzReworkModDefinition>
    {
        public override string Key()
        {
            return "S_SizzRework_BorrowSkill";
        }

        public override ModGDEInfo.LoadingType GetLoadingType()
        {
            return ModGDEInfo.LoadingType.Add;
        }

        public override void SetValue()
        {
            // 이후 교체할 시즈 스킬도 같은 방식으로 모드 소스에 등록합니다.
            PlusSkillView = Key();
            Name = "공용 전술 배치";
            Description = "대상 아군이 사용할 수 있는 모든 스킬(희귀 스킬 포함) 중 하나를 선택해 손으로 가져옵니다. 사용 후 이 카드는 손으로 돌아옵니다.";
            User = "Sizz_Rework_Sizz";
            Target = "ally";
            UseAp = 0;
            NotCount = true;
            NoDrop = true;
            Disposable = true;
            PlusViewBuffList = new List<string>();
            PlusKeyWords = new List<string>();
            SkillExtended = new List<string> { typeof(S_SizzRework_BorrowSkill).AssemblyQualifiedName };
        }
    }

}
