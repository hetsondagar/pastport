import Memory from '../models/Memory.js';
import { validationResult } from 'express-validator';

// Get all memories for constellation
export const getMemories = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const memories = await Memory.find({ userId })
      .select('title content category importance date relatedIds media position tags')
      .sort({ date: -1 });

    // Calculate positions for memories that don't have them
    const memoriesWithPositions = await Promise.all(
      memories.map(async (memory) => {
        if (!memory.position || (memory.position.x === 0 && memory.position.y === 0 && memory.position.z === 0)) {
          const newPosition = memory.calculatePosition();
          memory.position = newPosition;
          await memory.save();
        }
        return memory;
      })
    );

    // Get constellation data with related memories
    const constellationData = await Promise.all(
      memoriesWithPositions.map(async (memory) => {
        const relatedMemories = await memory.getRelatedMemories();
        return {
          id: memory._id,
          title: memory.title,
          content: memory.content,
          category: memory.category,
          importance: memory.importance,
          date: memory.date,
          relatedIds: memory.relatedIds,
          position: memory.position,
          tags: memory.tags,
          media: memory.media,
          relatedMemories: relatedMemories.map(rel => ({
            id: rel._id,
            title: rel.title,
            category: rel.category,
            position: rel.position
          }))
        };
      })
    );

    res.json({
      success: true,
      data: constellationData
    });
  } catch (error) {
    next(error);
  }
};

// Get single memory
export const getMemory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const memory = await Memory.findOne({ _id: id, userId });
    
    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found'
      });
    }

    res.json({
      success: true,
      data: memory
    });
  } catch (error) {
    next(error);
  }
};

// Create new memory
export const createMemory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const { title, content, category, importance, date, relatedIds, media, tags } = req.body;

    // Calculate position for new memory
    const tempMemory = new Memory({
      userId,
      title,
      content,
      category,
      importance: importance || 5,
      date: date || new Date(),
      relatedIds: relatedIds || [],
      media: media || [],
      tags: tags || []
    });

    const position = tempMemory.calculatePosition();

    const memory = new Memory({
      userId,
      title,
      content,
      category,
      importance: importance || 5,
      date: date || new Date(),
      relatedIds: relatedIds || [],
      media: media || [],
      tags: tags || [],
      position
    });

    await memory.save();

    res.status(201).json({
      success: true,
      message: 'Memory created successfully',
      data: memory
    });
  } catch (error) {
    next(error);
  }
};

// Update memory
export const updateMemory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    // Recalculate position if category or importance changed
    if (updateData.category || updateData.importance) {
      const tempMemory = new Memory({
        category: updateData.category || 'Travel',
        importance: updateData.importance || 5
      });
      updateData.position = tempMemory.calculatePosition();
    }

    const memory = await Memory.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found'
      });
    }

    res.json({
      success: true,
      message: 'Memory updated successfully',
      data: memory
    });
  } catch (error) {
    next(error);
  }
};

// Delete memory
export const deleteMemory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const memory = await Memory.findOneAndDelete({ _id: id, userId });

    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found'
      });
    }

    // Remove this memory from related memories
    await Memory.updateMany(
      { relatedIds: id },
      { $pull: { relatedIds: id } }
    );

    res.json({
      success: true,
      message: 'Memory deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get related memories for constellation
export const getRelatedMemories = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const memory = await Memory.findOne({ _id: id, userId });
    
    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found'
      });
    }

    const relatedMemories = await memory.getRelatedMemories();

    res.json({
      success: true,
      data: relatedMemories
    });
  } catch (error) {
    next(error);
  }
};

// Get memories by category
export const getMemoriesByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const userId = req.user._id;

    const memories = await Memory.find({ 
      userId, 
      category: category.charAt(0).toUpperCase() + category.slice(1) 
    })
      .select('title category importance date position')
      .sort({ importance: -1, date: -1 });

    res.json({
      success: true,
      data: memories
    });
  } catch (error) {
    next(error);
  }
};
