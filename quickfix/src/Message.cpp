
#include "stdafx.h"

#include "Message.hpp"
#include "DataDictionary.hpp"
#include "v8util.hpp"
#include "ObjectBuilder.hpp"

#include <v8.h>

#include <exception>

v8::Persistent<v8::Function> Message::s_constructor;

Message::Message()
  : m_message()
{}

Message::~Message()
{}

V8_MODULE_BEGIN(Message)
{
  V8_CLASS_BEGIN(Message);
  V8_CLASS_FUNCTION(setStringHeader);
  V8_CLASS_FUNCTION(setString);
  V8_CLASS_FUNCTION(headerToJSON);
  V8_CLASS_FUNCTION(messageToJSON);
  V8_CLASS_END(Message);
}

V8_CLASS_NEW(Message)

v8::Handle<v8::Value> Message::setStringHeader(v8::Arguments const& args)
{
  v8::HandleScope scope;

  Message* self = node::ObjectWrap::Unwrap<Message>(args.This());

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

  Message* self = node::ObjectWrap::Unwrap<Message>(args.This());
  v8::String::AsciiValue string(args[0]->ToString());
  DataDictionary* dict = node::ObjectWrap::Unwrap<DataDictionary>(args[1]->ToObject());
  
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

namespace {

  FIX::DataDictionary* extractDictionary(v8::Arguments const& args)
  {
    if (args.Length() == 0) {
      return 0;
    }
    else if (args.Length() == 1) {
      DataDictionary* dict = node::ObjectWrap::Unwrap<DataDictionary>(args[0]->ToObject());
      return dict->GetDataDictionary();
    }
    else {
      v8::ThrowException(v8::Exception::Error(v8::String::New("invalid argument")));
      return 0;
    }
  }

}

v8::Handle<v8::Value> Message::headerToJSON(v8::Arguments const& args)
{
  v8::HandleScope scope;
  Message* self = node::ObjectWrap::Unwrap<Message>(args.This());
  ObjectBuilder builder(extractDictionary(args));
  v8::Handle<v8::Value> header = builder.makeFieldList(self->m_message.getHeader());
  return scope.Close(header);
}

v8::Handle<v8::Value> Message::messageToJSON(v8::Arguments const& args)
{
  v8::HandleScope scope;
  Message* self = node::ObjectWrap::Unwrap<Message>(args.This());
  ObjectBuilder builder(extractDictionary(args));
  return scope.Close(builder(self->m_message));
}
