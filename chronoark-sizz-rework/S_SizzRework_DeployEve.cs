using System.Collections.Generic;
using ChronoArkMod;

namespace Sizz_Rework
{
    public class S_SizzRework_MoveEve : Skill_Extended
    {
        public override void SkillUseSingle(Skill skill, List<BattleChar> targets)
        {
            base.SkillUseSingle(skill, targets);

            P_SizzRework passive = skill.Master.Info.Passive as P_SizzRework;
            if (passive != null && targets != null && targets.Count > 0)
            {
                passive.SetEve(targets[0], true);
            }
        }
    }
}
