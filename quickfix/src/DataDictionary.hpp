#pragma once

#include <quickfix/DataDictionary.h>

#include <node.h>
#include <v8.h>
#include <uv.h>

#include <string>

class DataDictionary : public node::ObjectWrap
{
 public:

  // register JS functions
  static void Init(v8::Handle<v8::Object> target);

  // load dictionary asynchronosly
  static v8::Handle<v8::Value> loadDictionary(v8::Arguments const& args);

 private:
  DataDictionary();
  ~DataDictionary();

  static v8::Handle<v8::Value> New(v8::Arguments const& args);
  static v8::Handle<v8::Value> parseMessage(v8::Arguments const& args);

  static v8::Persistent<v8::Function> s_constructor;
  FIX::DataDictionary m_dataDictionary;
};
