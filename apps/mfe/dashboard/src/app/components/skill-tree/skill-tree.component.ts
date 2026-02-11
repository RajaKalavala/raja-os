import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Skill {
  name: string;
  level: number;
  currentXP: number;
  maxXP: number;
  icon: string;
  color: string;
  technologies: string[];
}

@Component({
  selector: 'app-skill-tree',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill-tree.component.html',
  styleUrls: ['./skill-tree.component.scss']
})
export class SkillTreeComponent {
  expandedSkill = signal<string | null>(null);

  skills: Skill[] = [
    {
      name: 'Frontend',
      level: 92,
      currentXP: 8420,
      maxXP: 10000,
      icon: '🎨',
      color: '#22c55e',
      technologies: ['Angular', 'React', 'TypeScript', 'Tailwind', 'RxJS']
    },
    {
      name: 'Backend',
      level: 88,
      currentXP: 7230,
      maxXP: 10000,
      icon: '⚙️',
      color: '#8b5cf6',
      technologies: ['Node.js', 'Python', 'Java', 'Spring Boot', 'GraphQL']
    },
    {
      name: 'Database',
      level: 82,
      currentXP: 6150,
      maxXP: 10000,
      icon: '🗄️',
      color: '#10b981',
      technologies: ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch']
    },
    {
      name: 'DevOps',
      level: 75,
      currentXP: 4890,
      maxXP: 10000,
      icon: '🚀',
      color: '#f59e0b',
      technologies: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform']
    }
  ];

  toggleSkill(skillName: string): void {
    if (this.expandedSkill() === skillName) {
      this.expandedSkill.set(null);
    } else {
      this.expandedSkill.set(skillName);
    }
  }

  getXPPercentage(skill: Skill): number {
    return (skill.currentXP / skill.maxXP) * 100;
  }
}
