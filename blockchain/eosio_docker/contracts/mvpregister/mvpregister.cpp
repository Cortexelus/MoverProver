#include <eosiolib/eosio.hpp>

using namespace eosio;

CONTRACT mvpregister : public eosio::contract {

  public:
    using contract::contract;

    mvpregister(
      name receiver,
      name code,
      datastream<const char*> ds
    ): contract(receiver, code, ds) {}

    ACTION reg(
      const name user,
      const std::string movename,
      const uint64_t moveid,
      // Not stored in table:
      const std::string fullname,
      const std::string email
    ) {
      require_auth( user );
      move_index moves(_code, _code.value);
      moves.emplace(user, [&]( auto& row ) {
        row.moveowner = user;
        row.movename = movename;
        row.moveid = moveid;
        row.islisted = false;
        row.buyprice = 0;
      });
    }

    ACTION list(
      const name user,
      const uint64_t moveid,
      const uint64_t buyprice
    ) {
      require_auth( user );
      move_index moves(_code, _code.value);
      auto iterator = moves.find(moveid);
      eosio_assert(iterator != moves.end(), "Record does not exist");
      moves.modify(iterator, user, [&]( auto& row ) {
        row.buyprice = buyprice;
        row.islisted = true;
      });
    }

    ACTION buy(
      const name user,
      const uint64_t moveid
    ) {
      require_auth( user );
      move_index moves(_code, _code.value);
      auto iterator = moves.find(moveid);
      eosio_assert(iterator != moves.end(), "Record does not exist");
      moves.modify(iterator, user, [&]( auto& row ) {
        row.moveowner = user;
        row.islisted = false;
        row.buyprice = 0;
      });
    }

  private:
    TABLE move {
      name moveowner;
      std::string movename;
      uint64_t moveid;
      bool islisted;
      uint64_t buyprice;

      uint64_t primary_key() const { return moveid; }
    };

    typedef eosio::multi_index<"moves"_n, move> move_index;
};

EOSIO_DISPATCH( mvpregister, (reg)(list)(buy) )
