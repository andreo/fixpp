#pragma once

#include <quickfix/DataDictionary.h>
#include <quickfix/Message.h>
#include <quickfix/FieldMap.h>
#include <string>
#include <iostream>

class ObjectBuilder
{
 private:
  FIX::DataDictionary* m_dataDictionary;
  
 public:
  ObjectBuilder(FIX::DataDictionary* dataDictionary);
  v8::Handle<v8::Object> operator()(FIX::Message const& msg)
    {
      return makeMessage(msg);
    }

  v8::Handle<v8::Array> makeFieldList(FIX::FieldMap const& fields) const;

 private:
  void setAttribute(v8::Handle<v8::Object>& obj,
		    std::string const& name,
		    v8::Handle<v8::Value> const& value) const;

  void setAttribute(v8::Handle<v8::Object>& obj,
		    std::string const& name,
		    std::string const& value) const;

  void setAttribute(v8::Handle<v8::Object>& obj,
		    std::string const& name,
		    int value) const;

  v8::Handle<v8::Object> makeField(int field, std::string const& value) const;
  v8::Handle<v8::Array> makeGroupList(FIX::FieldMap const& fields) const;
  v8::Handle<v8::Object> makeFieldMap(FIX::FieldMap const& fieldMap,
				      int groupField,
				      std::string const& groupName) const;
  v8::Handle<v8::Object> makeMessage(FIX::Message const& msg) const;
};
