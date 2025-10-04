import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Puzzle } from 'lucide-react';

interface LockTypeSelectorProps {
  lockType: string;
  onLockTypeChange: (type: string) => void;
  riddleQuestion: string;
  onRiddleQuestionChange: (question: string) => void;
  riddleAnswer: string;
  onRiddleAnswerChange: (answer: string) => void;
}

const LockTypeSelector = ({
  lockType,
  onLockTypeChange,
  riddleQuestion,
  onRiddleQuestionChange,
  riddleAnswer,
  onRiddleAnswerChange
}: LockTypeSelectorProps) => {
  return (
    <div className="space-y-4">
      <Label className="text-white font-medium">How should this capsule unlock?</Label>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Time-based unlock */}
        <Card
          className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
            lockType === 'time'
              ? 'ring-2 ring-blue-500/50 bg-blue-500/10'
              : 'glass-card border-white/10 bg-background/50 hover:bg-background/70'
          }`}
          onClick={() => onLockTypeChange('time')}
        >
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-sm font-medium text-white">Time-based</div>
            <div className="text-xs text-gray-400">Unlocks automatically</div>
          </CardContent>
        </Card>

        {/* Riddle-based unlock */}
        <Card
          className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
            lockType === 'riddle'
              ? 'ring-2 ring-purple-500/50 bg-purple-500/10'
              : 'glass-card border-white/10 bg-background/50 hover:bg-background/70'
          }`}
          onClick={() => onLockTypeChange('riddle')}
        >
          <CardContent className="p-4 text-center">
            <Puzzle className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-sm font-medium text-white">Riddle</div>
            <div className="text-xs text-gray-400">Solve to unlock</div>
          </CardContent>
        </Card>
      </div>

      {/* Riddle form - only show if riddle is selected */}
      {lockType === 'riddle' && (
        <div className="space-y-4 p-4 glass-card border-white/10 bg-background/50 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="riddle-question" className="text-white">
              Riddle Question
            </Label>
            <Textarea
              id="riddle-question"
              placeholder="What's the question that needs to be answered to unlock this capsule?"
              value={riddleQuestion}
              onChange={(e) => onRiddleQuestionChange(e.target.value)}
              className="glass-card border-white/10 bg-background/50 text-white placeholder:text-gray-400"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="riddle-answer" className="text-white">
              Correct Answer
            </Label>
            <Input
              id="riddle-answer"
              type="password"
              placeholder="The answer to unlock the capsule"
              value={riddleAnswer}
              onChange={(e) => onRiddleAnswerChange(e.target.value)}
              className="glass-card border-white/10 bg-background/50 text-white placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-400">
              The answer will be hidden and used to verify when someone tries to unlock the capsule.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LockTypeSelector;
