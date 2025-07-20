const { supabase } = require('../config/database')

class Canvas {
  static async create(roomId, initialState) {
    const { data, error } = await supabase
      .from('canvases')
      .insert([
        { 
          room_id: roomId, 
          pixel_data: initialState,
          created_at: new Date().toISOString()
        }
      ])
      .select()
    
    if (error) throw error
    return data[0]
  }
  
  static async findByRoomId(roomId) {
    const { data, error } = await supabase
      .from('canvases')
      .select('*')
      .eq('room_id', roomId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }
  
  static async updatePixelData(roomId, pixelData) {
    const { data, error } = await supabase
      .from('canvases')
      .update({ 
        pixel_data: pixelData,
        updated_at: new Date().toISOString()
      })
      .eq('room_id', roomId)
      .select()
    
    if (error) throw error
    return data[0]
  }
  
  static async saveSnapshot(roomId, userId, snapshotData) {
    const { data, error } = await supabase
      .from('snapshots')
      .insert([
        {
          room_id: roomId,
          user_id: userId,
          pixel_data: snapshotData,
          created_at: new Date().toISOString()
        }
      ])
      .select()
    
    if (error) throw error
    return data[0]
  }
}

module.exports = Canvas