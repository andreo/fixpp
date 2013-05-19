
#include "stdafx.h"

#include "Message.hpp"
#include "DataDictionary.hpp"
#include "v8util.hpp"
#include "ObjectBuilder.hpp"

#include <v8.hpp>

#include <exception>

v8::Persistent<v8::Function> Message::s_constructor;

Message::Message()
  : m_message()
{}

Message::~Message()
{}

V8_CLASS_BEGIN(Message)
V8_CLASS_FUNCTION(setStringHeader)
V8_CLASS_FUNCTION(setString)
V8_CLASS_FUNCTION(headerToJSON)
V8_CLASS_FUNCTION(toJSON)
V8_CLASS_END
V8_CLASS_NEW(Message)

v8::Handle<v8::Value> Message::setStringHeader(v8::Arguments const& args)
{
  v8::HandleScope scope;

  Message* self = ObjectWrap::Unwrap<Message>(args.This());

  v8::String::AsciiValue string(args[0]->ToString());
  
  try
    {
      self->m_message.setStringHeader(*string);
    }
  catch (std::exception const& error)
    {
      v8::ThrowException(v8::Exception::Error(v8::String::New(error.what())));
    }
  return scope.Close(v8::Undefined());
}

v8::Handle<v8::Value> Message::setString(v8::Arguments const& args)
{
  v8::HandleScope scope;

  Message* self = ObjectWrap::Unwrap<Message>(args.This());
  v8::String::AsciiValue string(args[0]->ToString());
  DataDictionary* dict = ObjectWrap::Unwrap<DataDictionary>(args[1]->ToObject());
  
  try
    {
      self->m_message.setString(*string, true, dict->GetDataDictionary());
    }
  catch (std::exception const& error)
    {
      v8::ThrowException(v8::Exception::Error(v8::String::New(error.what())));
    }
  return scope.Close(v8::Undefined());
}

v8::Handle<v8::Value> Message::headerToJSON(v8::Arguments const& args)
{
  v8::HandleScope scope;

  Message* self = ObjectWrap::Unwrap<Message>(args.This());
  DataDictionary* dict = ObjectWrap::Unwrap<DataDictionary>(args[0]->ToObject());

  ObjectBuilder builder(dict->GetDataDictionary());
  v8::Handle<v8::Value> header = builder.makeFieldList(self->m_message.getHeader());

  return scope.Close(header);
}

v8::Handle<v8::Value> Message::toJSON(v8::Arguments const& args)
{
  v8::HandleScope scope;

  Message* self = ObjectWrap::Unwrap<Message>(args.This());
  DataDictionary* dict = ObjectWrap::Unwrap<DataDictionary>(args[0]->ToObject());

  ObjectBuilder builder(dict->GetDataDictionary());

  return scope.Close(builder(self->m_message));
}
