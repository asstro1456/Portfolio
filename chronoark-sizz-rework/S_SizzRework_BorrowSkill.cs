using System.Collections.Generic;
using ChronoArkMod;
using GameDataEditor;

namespace Sizz_Rework
{
    public class S_SizzRework_BorrowSkill : Skill_Extended
    {
        public override void SkillUseSingle(Skill skill, List<BattleChar> targets)
        {
            base.SkillUseSingle(skill, targets);

            if (targets == null || targets.Count == 0)
            {
                return;
            }

            List<Skill> choices = new List<Skill>();
            foreach (GDESkillData data in PlayData.ALLSKILLLIST)
            {
                bool isReworkSizz = targets[0].Info.KeyData == "Sizz_Rework_Sizz";
                bool isTargetSkill = data.User == targets[0].Info.KeyData;
                bool isReworkSizzSkill = isReworkSizz && data.User == GDEItemKeys.Character_Sizz;
                if (isTargetSkill || isReworkSizzSkill)
                {
                    choices.Add(Skill.TempSkill(data.Key, targets[0], BattleSystem.instance.AllyTeam).CloneSkill());
                }
            }

            if (choices.Count > 0)
            {
                BattleSystem.instance.EffectDelays.Enqueue(BattleSystem.I_OtherSkillSelect(choices, Del, "빌릴 스킬 선택"));
            }

            // 사용한 원본은 제외되지만, 다음 사용을 위한 새 사본은 손에 남깁니다.
            BChar.MyTeam.Add(skill.CloneSkill(), true);
        }

        public void Del(SkillButton button)
        {
            BattleSystem.instance.AllyTeam.Add(button.Myskill, true);
        }
    }
}
