import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface MoodPickerProps {
  selectedMood: string;
  onMoodChange: (mood: string) => void;
}

const moods = [
  { value: 'happy', emoji: '🌞', label: 'Happy', color: 'bg-yellow-400' },
  { value: 'sad', emoji: '😢', label: 'Sad', color: 'bg-blue-400' },
  { value: 'excited', emoji: '🎉', label: 'Excited', color: 'bg-pink-400' },
  { value: 'angry', emoji: '😡', label: 'Angry', color: 'bg-red-400' },
  { value: 'calm', emoji: '🌙', label: 'Calm', color: 'bg-purple-400' },
  { value: 'neutral', emoji: '😐', label: 'Neutral', color: 'bg-gray-400' }
];

const MoodPicker = ({ selectedMood, onMoodChange }: MoodPickerProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-white font-medium">How are you feeling?</Label>
      <div className="grid grid-cols-3 gap-3">
        {moods.map((mood) => (
          <Card
            key={mood.value}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              selectedMood === mood.value
                ? 'ring-2 ring-white/50 bg-background/80'
                : 'glass-card border-white/10 bg-background/50 hover:bg-background/70'
            }`}
            onClick={() => onMoodChange(mood.value)}
          >
            <CardContent className="p-3 text-center">
              <div className="text-2xl mb-1">{mood.emoji}</div>
              <div className="text-xs text-white/80">{mood.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MoodPicker;
