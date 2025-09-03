// Supabase客户端配置文件
// 用于连接和操作Supabase数据库

import { createClient } from '@supabase/supabase-js'

// Supabase项目配置
const supabaseUrl = 'https://jmibsrzbrkpnbngnicdq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptaWJzcnpicmtwbmJuZ25pY2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjUxNzIsImV4cCI6MjA3MjQ0MTE3Mn0.erxX90iA9nBnUFJBc9YEtoGe5FAlUdoxcXrL-XXccv8'

// 创建Supabase客户端实例
// 这个客户端将用于所有数据库操作
const supabase = createClient(supabaseUrl, supabaseKey)

// 导出客户端实例供其他组件使用
export default supabase

// 导出一些常用的数据库操作函数
export {
  supabase,
  supabaseUrl,
  supabaseKey
}