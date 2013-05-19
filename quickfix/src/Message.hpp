#pragma once

#include <quickfix/Message.h>

#include <node.h>
#include <v8.h>
#include <uv.h>

#include <string>

class Message : public node::ObjectWrap
{
public:
  static void Init(v8::Handle<v8::Object> target);
  
private:
  Message();
  ~Message();

  static v8::Handle<v8::Value> New(v8::Arguments const& args);
  static v8::Handle<v8::Value> setStringHeader(v8::Arguments const& args);
  static v8::Handle<v8::Value> setString(v8::Arguments const& args);
  static v8::Handle<v8::Value> headerToJSON(v8::Arguments const& args);
  static v8::Handle<v8::Value> toJSON(v8::Arguments const& args);

  FIX::Message m_message;
  static v8::Persistent<v8::Function> s_constructor;
};
