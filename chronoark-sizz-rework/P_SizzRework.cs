using System.Collections.Generic;
using ChronoArkMod;
using GameDataEditor;

namespace Sizz_Rework
{
    public class P_SizzRework : Passive_Char, IP_BattleStart_Ones, IP_PlayerTurn, IP_TurnEnd
    {
        private const string LegacyEveBuffKey = "B_SizzRework_Eve";
        private const string OriginalEveBuffKey = "B_SizzRework_Eve_Original";

        private string EveBuffKey
        {
            get
            {
                return BChar != null && BChar.Info.KeyData == GDEItemKeys.Character_Sizz
                    ? OriginalEveBuffKey
                    : LegacyEveBuffKey;
            }
        }

        public override void Init()
        {
            OnePassive = true;
            base.Init();
        }

        public void BattleStart(BattleSystem ins)
        {
            SetEve(BChar);
        }

        public void Turn()
        {
            B_SizzReworkEve eve = FindEve();
            if (eve != null)
            {
                eve.GainAttackChance();
            }

            List<Skill> targets = new List<Skill>();
            foreach (BattleAlly ally in BattleSystem.instance.AllyList)
            {
                Skill moveEve = Skill.TempSkill("S_SizzRework_MoveEve", ally, BChar.MyTeam);
                moveEve.FreeUse = true;
                moveEve.ExtendedAdd(new EvePlacementTarget { Target = ally });
                targets.Add(moveEve);
            }

            BattleSystem.DelayInput(BattleSystem.I_OtherSkillSelect(targets, SelectEveTarget, "이브 이동 대상 선택"));
        }

        public void TurnEnd()
        {
            B_SizzReworkEve eve = FindEve();
            if (eve == null || eve.BChar == BChar)
            {
                ClearAnxiety();
                return;
            }

            Buff anxiety = BChar.BuffReturn("B_SizzRework_Anxiety");
            if (anxiety == null)
            {
                return;
            }

            int painDamage = 3 + (anxiety.StackNum * 2);
            BChar.Damage(BChar, painDamage, Cri: false, Pain: true);
            // 이브가 계속 다른 아군에게 있으면 다음 턴 피해를 위해 불안을 누적합니다.
            BChar.BuffAdd("B_SizzRework_Anxiety", BChar, false, 0, false, 0, false);
        }

        public void SelectEveTarget(SkillButton button)
        {
            EvePlacementTarget target = button.Myskill.ExtendedFind(typeof(EvePlacementTarget).Name) as EvePlacementTarget;
            if (target != null)
            {
                SetEve(target.Target, true);
            }
        }

        public void SetEve(BattleChar target, bool playMoveEffect = false)
        {
            if (BChar == null || target == null)
            {
                return;
            }

            foreach (BattleAlly ally in BattleSystem.instance.AllyList)
            {
                if (ally.BuffFind(EveBuffKey))
                {
                    ally.BuffRemove(EveBuffKey, true);
                }
            }

            target.BuffAdd(EveBuffKey, BChar, false, 0, false, 0, false);
            if (playMoveEffect)
            {
                // 원본 "도와줘 이브!"의 버프 이펙트를 이브 이동 확인용으로 재사용합니다.
                BChar.ParticleOut(Skill.TempSkill("S_SizzRework_MoveEve", BChar, BChar.MyTeam), target);
            }
            RefreshStable(target == BChar);
            if (target == BChar)
            {
                ClearAnxiety();
            }
            else if (!BChar.BuffFind("B_SizzRework_Anxiety"))
            {
                // 이브가 시즈에게서 떠나는 즉시 불안 1중첩을 생성합니다.
                BChar.BuffAdd("B_SizzRework_Anxiety", BChar, false, 0, false, 0, false);
            }
        }

        private B_SizzReworkEve FindEve()
        {
            foreach (BattleAlly ally in BattleSystem.instance.AllyList)
            {
                B_SizzReworkEve eve = ally.BuffReturn(EveBuffKey) as B_SizzReworkEve;
                if (eve != null)
                {
                    return eve;
                }
            }
            return null;
        }

        private void RefreshStable(bool stable)
        {
            if (stable)
            {
                if (!BChar.BuffFind("B_SizzRework_Stable"))
                {
                    BChar.BuffAdd("B_SizzRework_Stable", BChar, false, 0, false, 0, false);
                }
            }
            else if (BChar.BuffFind("B_SizzRework_Stable"))
            {
                BChar.BuffRemove("B_SizzRework_Stable", true);
            }
        }

        private void ClearAnxiety()
        {
            if (BChar.BuffFind("B_SizzRework_Anxiety"))
            {
                BChar.BuffRemove("B_SizzRework_Anxiety", true);
            }
        }
    }

    public class EvePlacementTarget : Skill_Extended
    {
        public BattleAlly Target;
    }

    public class B_SizzReworkEve : P_Sizz_0
    {
        public override void Init()
        {
            int attackChance = P_Sizz.stack;
            base.Init();
            // 이브 이동은 공격 기회를 만들거나 소모하지 않습니다.
            P_Sizz.stack = attackChance;
        }

        public void GainAttackChance()
        {
            AttackStack();
        }
    }

    public class B_SizzReworkStable : Buff, IP_HealChange
    {
        public override void Init()
        {
            base.Init();
            PlusPerStat.Heal = 10;
        }

        public void HealChange(BattleChar healer, BattleChar healedChar, ref int healNum, bool cri, ref bool force)
        {
            if (healer == BChar)
            {
                force = true;
            }
        }
    }

    public class B_SizzReworkAnxiety : Buff
    {
    }

}
